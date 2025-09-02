const logger = require('../utils/logger');

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.userConnections = new Map();
  }

  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Set(),
        messages: [],
        createdAt: new Date()
      });
      logger.info(`Room created: ${roomId}`);
    }
    return this.rooms.get(roomId);
  }

  joinRoom(roomId, userId, username, ws) {
    const room = this.createRoom(roomId);
    room.users.add({ userId, username });
    
    this.userConnections.set(ws, { roomId, userId, username });
    
    // Send room history to new user
    ws.send(JSON.stringify({
      type: 'room-joined',
      roomId,
      users: Array.from(room.users),
      messages: room.messages.slice(-50) // Last 50 messages
    }));

    // Notify other users
    this.broadcastToRoom(roomId, {
      type: 'user-joined',
      user: { userId, username },
      users: Array.from(room.users)
    }, ws);

    logger.info(`User ${username} joined room ${roomId}`);
    return room;
  }

  leaveRoom(ws) {
    const connection = this.userConnections.get(ws);
    if (!connection) return;

    const { roomId, userId, username } = connection;
    const room = this.rooms.get(roomId);
    
    if (room) {
      room.users = new Set(Array.from(room.users).filter(u => u.userId !== userId));
      
      this.broadcastToRoom(roomId, {
        type: 'user-left',
        user: { userId, username },
        users: Array.from(room.users)
      });

      // Clean up empty rooms
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
        logger.info(`Empty room deleted: ${roomId}`);
      }
    }

    this.userConnections.delete(ws);
    logger.info(`User ${username} left room ${roomId}`);
  }

  addMessage(roomId, userId, username, message) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const chatMessage = {
      id: Date.now().toString(),
      userId,
      username,
      message,
      timestamp: new Date().toISOString()
    };

    room.messages.push(chatMessage);
    
    // Keep only last 100 messages
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }

    this.broadcastToRoom(roomId, {
      type: 'new-message',
      message: chatMessage
    });

    return chatMessage;
  }

  broadcastToRoom(roomId, data, excludeWs = null) {
    for (const [ws, connection] of this.userConnections.entries()) {
      if (connection.roomId === roomId && ws !== excludeWs) {
        try {
          ws.send(JSON.stringify(data));
        } catch (error) {
          logger.error('Error broadcasting to room:', error);
          this.userConnections.delete(ws);
        }
      }
    }
  }

  getRoomStats() {
    return {
      totalRooms: this.rooms.size,
      totalConnections: this.userConnections.size,
      rooms: Array.from(this.rooms.entries()).map(([id, room]) => ({
        id,
        userCount: room.users.size,
        messageCount: room.messages.length,
        createdAt: room.createdAt
      }))
    };
  }
}

module.exports = RoomManager;