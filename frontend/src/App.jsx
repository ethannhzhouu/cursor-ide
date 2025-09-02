import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import Chat from './components/Chat';
import RoomHeader from './components/RoomHeader';
import { ChatManager } from './utils/collaboration';

const Room = () => {
  const { roomId } = useParams();
  const [chatManager, setChatManager] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [collaborativeUsers, setCollaborativeUsers] = useState([]);

  useEffect(() => {
    const manager = new ChatManager(
      roomId,
      null, // Message handler will be set by Chat component
      setChatUsers
    );
    
    setChatManager(manager);

    return () => {
      manager.disconnect();
    };
  }, [roomId]);

  const handleCollaborationReady = (collaboration) => {
    // Collaboration is ready, users will be tracked automatically
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <RoomHeader 
        roomId={roomId} 
        users={chatUsers} 
        collaborativeUsers={collaborativeUsers}
        chatManager={chatManager}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          <CodeEditor 
            roomId={roomId}
            onCollaborationReady={handleCollaborationReady}
            onUsersChange={setCollaborativeUsers}
          />
        </div>
        
        <Chat chatManager={chatManager} />
      </div>
    </div>
  );
};

const HomePage = () => {
  const [roomId, setRoomId] = useState('');

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 10);
    setRoomId(id);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      window.location.href = `/room/${roomId.trim()}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Cursor: Collaborative IDE</h1>
          <p className="text-gray-400">
            Real-time collaborative code editing with your team
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter room ID or generate one"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Join Room
            </button>
            
            <button
              onClick={generateRoomId}
              className="bg-gray-700 hover:bg-gray-600 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Share the room URL with others to collaborate in real-time</p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;