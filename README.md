# 🚀 Cursor: Collaborative IDE - Real-Time Collaborative IDE

A web-based real-time collaborative IDE with Monaco Editor, powered by Yjs and WebSocket for seamless team coding.

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit the same file simultaneously using Yjs CRDT
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Room-based Sessions**: Each session has a unique room ID for easy sharing
- **Real-time Chat**: Built-in chat functionality per room
- **User Management**: Set custom usernames and see online users
- **Conflict-free Editing**: Uses Yjs for operational transformation
- **Responsive Design**: Works on desktop and mobile devices
- **Shareable Links**: Easy collaboration through URL sharing

## 🏗️ Architecture

### Frontend (React + Vite)
- **Monaco Editor**: Code editing with syntax highlighting
- **Yjs**: Conflict-free replicated data types for real-time collaboration
- **WebSocket**: Real-time communication
- **React Router**: Room-based routing
- **Tailwind CSS**: Modern, responsive styling

### Backend (Node.js + Express)
- **WebSocket Server**: Handles real-time collaboration and chat
- **Yjs Integration**: Manages document synchronization
- **Room Management**: In-memory room and user management
- **CORS Configuration**: Secure cross-origin communication

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.local):**
```env
VITE_BACKEND_URL=localhost:3001
VITE_API_URL=http://localhost:3001
```

### 3. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
```

### 4. Open Browser
Visit `http://localhost:5173` and start collaborating!

## 📁 Project Structure

```
cursor-ide/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── rooms/
│   │   └── roomManager.js     # Room and user management
│   └── utils/
│       └── logger.js          # Logging utility
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main app component
    │   ├── components/
    │   │   ├── CodeEditor.jsx # Monaco editor wrapper
    │   │   ├── Chat.jsx       # Chat interface
    │   │   ├── RoomHeader.jsx # Room header with user info
    │   │   └── UsernameModal.jsx # Username settings
    │   └── utils/
    │       └── collaboration.js # Yjs and WebSocket managers
    ├── package.json
    └── vite.config.js
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)

**Vercel:**
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables:
   - `VITE_BACKEND_URL=your-backend-domain.com`
4. Deploy

**Netlify:**
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables in Netlify dashboard

### Backend (Railway/Heroku/AWS)

**Railway:**
1. Connect GitHub repo
2. Set environment variables:
   - `PORT=3001`
   - `NODE_ENV=production`  
   - `FRONTEND_URL=https://your-frontend-domain.vercel.app`
3. Deploy

**Heroku:**
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-domain.vercel.app
git push heroku main
```

## 🔧 Configuration

### WebSocket URLs
The frontend automatically detects production vs development:
- **Development**: `ws://localhost:3001`
- **Production**: `wss://your-backend-domain.com`

### CORS Configuration
Add your production frontend URL to the backend CORS configuration.

## 🛠️ Development

### Adding New Features
1. **New Language Support**: Extend Monaco Editor configuration
2. **File Management**: Add file tree and multiple file support
3. **Persistence**: Add database integration for room persistence
4. **Authentication**: Add user authentication system

### Performance Optimization
- **Document Persistence**: Save Yjs documents to database
- **User Limit**: Implement room user limits
- **Rate Limiting**: Add message rate limiting
- **Cleanup**: Implement automatic room cleanup

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Check CORS configuration
- Verify environment variables
- Ensure backend is running and accessible

### Collaboration Not Working
- Check browser console for Yjs errors
- Verify WebSocket connection is established
- Check room ID consistency

### Deployment Issues
- Verify environment variables are set correctly
- Check WebSocket URL configuration for production
- Ensure HTTPS for production WebSocket connections

## 📝 License

MIT License - feel free to use for personal and commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🎯 Roadmap

- [ ] File management system
- [ ] Multiple programming language support
- [ ] User authentication
- [ ] Room persistence
- [ ] Git integration
- [ ] Plugin system
- [ ] Themes and customization

---

Built with ❤️ using React, Monaco Editor, Yjs, and Node.js
