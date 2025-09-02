import React from 'react';
import { Users, Copy, Check, User } from 'lucide-react';
import UsernameModal from './UsernameModal';

const RoomHeader = ({ roomId, users, collaborativeUsers, chatManager }) => {
  const [copied, setCopied] = React.useState(false);
  const [showUsernameModal, setShowUsernameModal] = React.useState(false);

  const copyRoomLink = async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleUsernameChange = (newUsername) => {
    if (chatManager) {
      chatManager.setUsername(newUsername);
      // Rejoin room with new username
      chatManager.joinRoom();
    }
  };

  const totalUsers = Math.max(collaborativeUsers.length, 1);

  const currentUsername = chatManager?.username || 'Anonymous';

  return (
    <>
      <div className="bg-gray-900 text-white p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Cursor: Collaborative IDE</h1>
            <p className="text-sm text-gray-400">Room: {roomId}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users size={20} />
              <span className="text-sm">{totalUsers} user{totalUsers !== 1 ? 's' : ''}</span>
            </div>

            <button
              onClick={() => setShowUsernameModal(true)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
              title="Change username"
            >
              <User size={16} />
              <span className="text-sm">{currentUsername}</span>
            </button>
            
            <button
              onClick={copyRoomLink}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="text-sm">{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        currentUsername={currentUsername}
        onSave={handleUsernameChange}
      />
    </>
  );
};

export default RoomHeader;