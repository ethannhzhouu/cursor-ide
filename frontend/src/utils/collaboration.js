import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

export class CollaborationManager {
  constructor(roomId, editor, onUsersChange, onSynced) {
    this.roomId = roomId;
    this.editor = editor;
    this.onUsersChange = onUsersChange;
    this.onSynced = onSynced;
    this.provider = null;
    this.binding = null;
    this.synced = false;
    
    try {
      // Initialize Yjs
      this.ydoc = new Y.Doc();
      this.ytext = this.ydoc.getText('monaco');

      this.setupCollaboration();
    } catch (error) {
      console.error('Error initializing collaboration:', error);
      // Set up fallback user tracking
      this.setupFallback();
    }
  }

  setupFallback() {
    // If Y.js fails, at least show user count
    setTimeout(() => {
      if (this.onUsersChange) {
        const dummyUser = {
          clientId: 'local',
          name: `User ${Math.floor(Math.random() * 1000)}`,
          color: this.generateUserColor(),
          colorLight: this.generateUserColor() + '33'
        };
        this.onUsersChange([dummyUser]);
      }
      
      if (this.onSynced) {
        this.onSynced(true, ''); // Assume empty for fallback
      }
    }, 100);
  }

  setupCollaboration() {
    if (!this.editor) {
      console.warn('No editor provided for collaboration');
      this.setupFallback();
      return;
    }

    try {
      // WebSocket URL - adjust for production
      const wsUrl = import.meta.env.PROD 
        ? `wss://${import.meta.env.VITE_BACKEND_URL}`
        : `ws://localhost:3001`;
      
      // Create WebSocket provider with room ID as document name
      this.provider = new WebsocketProvider(wsUrl, this.roomId, this.ydoc);

      // Wait for the model to be ready before setting up binding
      const model = this.editor.getModel();
      if (!model) {
        console.error('Monaco model not ready for collaboration');
        this.setupFallback();
        return;
      }

      // Set up Monaco binding with proper cursor awareness
      this.binding = new MonacoBinding(
        this.ytext,
        model,
        new Set([this.editor]),
        this.provider.awareness
      );

      // Log when binding is ready
      console.log('Monaco binding initialized successfully');
    } catch (error) {
      console.error('Error setting up collaboration WebSocket:', error);
      this.setupFallback();
      return;
    }

    // Set user info for awareness
    this.provider.awareness.setLocalStateField('user', {
      name: `User ${Math.floor(Math.random() * 1000)}`,
      color: this.generateUserColor(),
      colorLight: this.generateUserColor() + '33'
    });

    console.log('User set in awareness:', this.provider.awareness.getLocalState());

    // Add cursor position tracking
    this.editor.onDidChangeCursorPosition((e) => {
      if (this.binding && this.provider.awareness) {
        // Update cursor position in awareness
        this.provider.awareness.setLocalStateField('cursor', {
          position: e.position,
          selection: this.editor.getSelection()
        });
      }
    });

    // Listen to awareness changes
    this.provider.awareness.on('change', () => {
      if (this.onUsersChange) {
        // Get all awareness states including local client
        const allStates = Array.from(this.provider.awareness.getStates().entries());
        const users = allStates.map(([clientId, state]) => ({
          clientId,
          ...state.user,
          cursor: state.cursor
        })).filter(user => user.name);
        
        // Always include at least 1 user (current user)
        const userCount = Math.max(users.length, 1);
        console.log(`Collaborative users: ${userCount}`, users);
        
        this.onUsersChange(users);
      }
    });

    // Trigger initial awareness update - ensure we always show at least 1 user
    setTimeout(() => {
      console.log('Triggering initial awareness update...');
      if (this.onUsersChange) {
        // Always show at least the current user
        const dummyUser = {
          clientId: 'local',
          name: `User ${Math.floor(Math.random() * 1000)}`,
          color: this.generateUserColor(),
          colorLight: this.generateUserColor() + '33'
        };
        
        console.log('Setting initial user:', dummyUser);
        this.onUsersChange([dummyUser]);
      }
    }, 100);

    this.provider.on('status', (event) => {
      console.log('Y.js provider status:', event.status);
      
      // When we're connected and synced, trigger the callback
      if (event.status === 'connected' && !this.synced) {
        console.log('Provider connected, setting up sync...');
        this.synced = true;
        // Wait for the document to sync properly
        setTimeout(() => {
          // Check if Y.js document is empty
          const yContent = this.ytext.toString();
          const isEmpty = !yContent || yContent.trim() === '';
          
          console.log('Sync check - Y.js content length:', yContent.length, 'isEmpty:', isEmpty);
          console.log('Y.js content preview:', yContent.substring(0, 100));
          
          // Always call onSynced callback with document state and content
          if (this.onSynced) {
            console.log('Calling onSynced callback with isEmpty:', isEmpty);
            this.onSynced(isEmpty, yContent);
          }
        }, 500); // Longer delay to ensure complete sync
      }
    });

    // Handle document changes to keep things in sync
    this.ytext.observe((event) => {
      // Force cursor position recalculation after remote changes
      setTimeout(() => {
        if (this.editor) {
          const position = this.editor.getPosition();
          this.editor.setPosition(position);
        }
      }, 10);
    });

    console.log('Y.js collaboration initialized');
  }

  setUser(userInfo) {
    if (this.provider) {
      this.provider.awareness.setLocalStateField('user', {
        ...userInfo,
        color: userInfo.color || this.generateUserColor(),
        colorLight: (userInfo.color || this.generateUserColor()) + '33'
      });
    }
  }

  generateUserColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  destroy() {
    if (this.binding) {
      this.binding.destroy();
    }
    if (this.provider) {
      this.provider.destroy();
    }
    if (this.ydoc) {
      this.ydoc.destroy();
    }
  }
}

export class ChatManager {
  constructor(roomId, onMessage, onUsersUpdate) {
    this.roomId = roomId;
    this.onMessage = onMessage;
    this.onUsersUpdate = onUsersUpdate;
    this.ws = null;
    this.userId = Math.random().toString(36).substr(2, 9);
    this.username = this.getStoredUsername() || `User_${Math.floor(Math.random() * 1000)}`;
    this.connect();
  }

  getStoredUsername() {
    return localStorage.getItem('cursor-ide-username');
  }

  setStoredUsername(username) {
    localStorage.setItem('cursor-ide-username', username);
  }

  connect() {
    const wsUrl = import.meta.env.PROD 
      ? `wss://${import.meta.env.VITE_BACKEND_URL}/chat`
      : `ws://localhost:3001/chat`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Chat WebSocket connected');
      this.joinRoom();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'room-joined':
            if (this.onUsersUpdate) {
              this.onUsersUpdate(data.users);
            }
            // Load previous messages
            data.messages.forEach(msg => {
              if (this.onMessage) {
                this.onMessage(msg);
              }
            });
            break;
            
          case 'new-message':
            if (this.onMessage) {
              this.onMessage(data.message);
            }
            break;
            
          case 'user-joined':
          case 'user-left':
            if (this.onUsersUpdate) {
              this.onUsersUpdate(data.users);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };
  }

  joinRoom() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'join-room',
        roomId: this.roomId,
        userId: this.userId,
        username: this.username
      }));
    }
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'send-message',
        roomId: this.roomId,
        userId: this.userId,
        username: this.username,
        message
      }));
    }
  }

  setUsername(username) {
    this.username = username;
    this.setStoredUsername(username);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}