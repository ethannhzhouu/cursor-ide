# 🧪 Testing Guide

## Manual Testing Checklist

### Basic Functionality
- [ ] **Homepage loads correctly**
  - Visit `http://localhost:5173`
  - Should see clean landing page with room ID input

- [ ] **Room creation works**
  - Click "Generate" button
  - Should generate a random room ID
  - Click "Join Room" 
  - Should navigate to `/room/{roomId}`

- [ ] **Code editor loads**
  - Monaco editor should appear
  - Should have syntax highlighting
  - Should show default welcome code

- [ ] **Chat functionality**
  - Click chat icon to expand chat panel
  - Should be able to type and send messages
  - Messages should appear in chat history

- [ ] **Username setting**
  - Click on username in header
  - Should open username modal
  - Should be able to set custom username
  - Username should persist in localStorage

### Real-time Collaboration Testing

**Test with 2+ Browser Windows:**

1. **Open multiple windows:**
   ```
   Window 1: http://localhost:5173/room/test123
   Window 2: http://localhost:5173/room/test123
   ```

2. **Test code synchronization:**
   - Type in Window 1 editor
   - Changes should appear in Window 2 immediately
   - Try editing same line from both windows
   - Should handle conflicts gracefully

3. **Test chat synchronization:**
   - Send message from Window 1
   - Should appear in Window 2 chat
   - Try rapid message sending
   - All messages should appear in order

4. **Test user presence:**
   - User count should update when joining/leaving
   - Usernames should appear in header
   - Set different usernames in each window

### Performance Testing

- [ ] **Large code files**
  - Paste large code snippet (1000+ lines)
  - Should sync across all clients
  - Performance should remain smooth

- [ ] **Multiple users**
  - Test with 5+ concurrent users
  - All should see real-time updates
  - Chat should work for all users

- [ ] **Network interruption**
  - Disable network briefly
  - Re-enable network
  - Should reconnect automatically
  - Should sync missed changes

### Edge Cases

- [ ] **Invalid room IDs**
  - Try special characters in room ID
  - Try very long room IDs
  - Should handle gracefully

- [ ] **Browser refresh**
  - Refresh page mid-editing
  - Should rejoin room automatically
  - Should preserve username

- [ ] **Copy room link**
  - Click "Share" button in header
  - Link should be copied to clipboard
  - Pasting link should open same room

## Automated Testing Script

Create this test file: `test-collaboration.js`

```javascript
// Simple WebSocket test script
const WebSocket = require('ws');

async function testCollaboration() {
  console.log('🧪 Testing Cursor IDE Collaboration...');
  
  // Test 1: Y.js WebSocket connection
  const yjsWs = new WebSocket('ws://localhost:3001/yjs?room=test');
  yjsWs.on('open', () => {
    console.log('✅ Y.js WebSocket connected');
    yjsWs.close();
  });
  
  // Test 2: Chat WebSocket connection
  const chatWs = new WebSocket('ws://localhost:3001/chat');
  chatWs.on('open', () => {
    console.log('✅ Chat WebSocket connected');
    
    // Test joining room
    chatWs.send(JSON.stringify({
      type: 'join-room',
      roomId: 'test',
      userId: 'test-user',
      username: 'Test User'
    }));
  });
  
  chatWs.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('📨 Received:', message.type);
    
    if (message.type === 'room-joined') {
      console.log('✅ Successfully joined room');
      chatWs.close();
    }
  });
  
  // Test 3: Health check
  try {
    const response = await fetch('http://localhost:3001/health');
    const health = await response.json();
    console.log('✅ Health check passed:', health.status);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

testCollaboration();
```

Run with: `node test-collaboration.js`

## Browser Developer Tools Testing

### Console Commands:

```javascript
// Test Yjs document state
console.log('Y.js Document:', window.ydoc?.getText('monaco')?.toString());

// Test WebSocket connections
console.log('WebSocket states:', {
  yjs: window.yjsWs?.readyState,
  chat: window.chatWs?.readyState
});

// Test collaboration manager
console.log('Users:', window.collaborationManager?.awareness);
```

### Network Tab:
- Check WebSocket connections are established
- Monitor message frequency during typing
- Verify no excessive polling or errors

### Performance Tab:
- Monitor CPU usage during real-time editing
- Check memory usage with large documents
- Verify smooth scrolling and typing

## Expected Results

### ✅ Success Criteria:
- All WebSocket connections established
- Real-time synchronization works
- Chat messages sync instantly
- User presence updates correctly
- No console errors
- Smooth performance with multiple users

### ❌ Common Issues:
- **CORS errors**: Check backend CORS configuration
- **WebSocket connection failed**: Verify backend is running
- **Yjs sync issues**: Check room ID consistency
- **Chat not working**: Verify message format

## Performance Benchmarks

### Expected Performance:
- **Typing latency**: < 50ms between windows
- **Message sync**: < 100ms for chat messages
- **Memory usage**: < 100MB per tab
- **CPU usage**: < 10% during normal editing

### Load Testing:
Test with increasing number of users:
- 2 users: Should be instant
- 5 users: Should remain smooth
- 10+ users: May need optimization

---

🎯 **Testing Complete!** Your Cursor IDE should handle real-time collaboration flawlessly.
