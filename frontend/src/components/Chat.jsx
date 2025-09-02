import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

const Chat = ({ chatManager }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatManager) return;

    const handleMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    chatManager.onMessage = handleMessage;

    return () => {
      if (chatManager.onMessage === handleMessage) {
        chatManager.onMessage = null;
      }
    };
  }, [chatManager]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && chatManager) {
      chatManager.sendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300 ${
      isExpanded ? 'w-80' : 'w-12'
    }`}>
      {/* Chat Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 hover:bg-gray-700 border-b border-gray-700 flex items-center justify-center"
        title={isExpanded ? 'Collapse Chat' : 'Expand Chat'}
      >
        <MessageCircle size={20} className="text-gray-400" />
      </button>

      {isExpanded && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="font-medium text-blue-400">
                      {msg.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-200 leading-relaxed break-words">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-700 p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;