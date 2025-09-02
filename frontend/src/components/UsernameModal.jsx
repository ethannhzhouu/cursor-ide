import React, { useState } from 'react';
import { User, X } from 'lucide-react';

const UsernameModal = ({ isOpen, onClose, currentUsername, onSave }) => {
  const [username, setUsername] = useState(currentUsername || '');

  const handleSave = () => {
    if (username.trim()) {
      onSave(username.trim());
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User size={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Set Username</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choose your display name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={!username.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 px-4 rounded-lg font-medium transition-colors text-white"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
