const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const RoomManager = require('./rooms/roomManager');
const { LeveldbPersistence } = require('y-leveldb');
const logger = require('./utils/logger');
require('dotenv').config();

// Y.js imports
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

const app = express();
const server = http.createServer(app);

// Initialize LevelDB persistence for Y.js documents
const leveldbPersistence = new LeveldbPersistence('./y-leveldb-documents');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Room manager
const roomManager = new RoomManager();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    ...roomManager.getRoomStats()
  });
});

// WebSocket servers setup
const wss = new WebSocketServer({ 
  server,
  clientTracking: true 
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/chat') {
    // Chat WebSocket connection
    logger.info('Chat WebSocket connection established');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join-room':
            roomManager.joinRoom(
              message.roomId, 
              message.userId, 
              message.username, 
              ws
            );
            break;
            
          case 'send-message':
            roomManager.addMessage(
              message.roomId,
              message.userId,
              message.username,
              message.message
            );
            break;
            
          default:
            logger.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        logger.error('Error handling chat message:', error);
      }
    });

    ws.on('close', () => {
      roomManager.leaveRoom(ws);
    });

    ws.on('error', (error) => {
      logger.error('Chat WebSocket error:', error);
      roomManager.leaveRoom(ws);
    });
  } else {
    // Y.js WebSocket connection (any other path including document names)
    logger.info(`Y.js WebSocket connection established for path: ${url.pathname}`);
    
    ws.on('error', (error) => {
      logger.error('Y.js WebSocket connection error:', error);
    });

    ws.on('close', (code, reason) => {
      logger.info(`Y.js WebSocket connection closed: code=${code}, reason=${reason}`);
    });
    
    try {
      // Use the official y-websocket setup with LevelDB persistence
      setupWSConnection(ws, req, { 
        gc: true,
        persistence: leveldbPersistence
      });
      logger.info('Y.js setupWSConnection completed successfully with persistence');
    } catch (error) {
      logger.error('Error in setupWSConnection:', error);
      ws.close(1011, 'Setup failed');
    }
  }
});

// Error handling
wss.on('error', (error) => {
  logger.error('WebSocket Server error:', error);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`WebSocket server available at ws://localhost:${PORT}/`);
  logger.info(`Y.js collaboration available at ws://localhost:${PORT}/`);
  logger.info(`Chat WebSocket available at ws://localhost:${PORT}/chat`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  leveldbPersistence.destroy();
  server.close(() => {
    logger.info('Server shutdown complete');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  leveldbPersistence.destroy();
  server.close(() => {
    logger.info('Server shutdown complete');
    process.exit(0);
  });
});