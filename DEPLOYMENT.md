# 🌐 Deployment Guide

This guide covers deploying your Cursor IDE to production using popular platforms.

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Prepare your repository:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Select the `frontend` folder as root directory
   - Set build command: `npm run build`
   - Set output directory: `dist`

3. **Environment Variables:**
   Add these in Vercel dashboard:
   ```
   VITE_BACKEND_URL=your-backend-domain.railway.app
   VITE_API_URL=https://your-backend-domain.railway.app
   ```

4. **Deploy!**
   Your frontend will be available at: `https://your-project.vercel.app`

### Option 2: Netlify

1. **Build locally:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or connect GitHub for automatic deployments

3. **Environment Variables:**
   Set in Netlify dashboard:
   ```
   VITE_BACKEND_URL=your-backend-domain.railway.app
   VITE_API_URL=https://your-backend-domain.railway.app
   ```

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Prepare your repository:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Connect GitHub repository
   - Select the `backend` folder

3. **Environment Variables:**
   Set in Railway dashboard:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-project.vercel.app
   PORT=3001
   ```

4. **Custom Start Command:**
   In Railway settings, set start command: `npm start`

### Option 2: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku app:**
   ```bash
   cd backend
   heroku create your-cursor-ide-backend
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-project.vercel.app
   ```

4. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create app:**
   - Go to DigitalOcean
   - Create new App
   - Connect GitHub repository

2. **Configure:**
   - Select `backend` folder
   - Set run command: `npm start`
   - Set environment variables

3. **Deploy:**
   Your backend will be available at: `https://your-app.ondigitalocean.app`

## SSL/HTTPS Configuration

### Important Notes:
- Production WebSocket connections require WSS (secure WebSocket)
- Make sure your backend supports HTTPS
- Update WebSocket URLs in frontend for production

### Frontend WebSocket Configuration:
Update `frontend/src/utils/collaboration.js`:

```javascript
const wsUrl = import.meta.env.PROD 
  ? `wss://${import.meta.env.VITE_BACKEND_URL}/yjs?room=${this.roomId}`
  : `ws://localhost:3001/yjs?room=${this.roomId}`;
```

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend health check responds: `https://your-backend/health`
- [ ] WebSocket connections work
- [ ] Real-time collaboration functions
- [ ] Chat messaging works
- [ ] Room sharing works
- [ ] Username persistence works
- [ ] Mobile responsiveness

## Monitoring & Analytics

### Basic Monitoring:
Add to your backend for simple monitoring:

```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    ...roomManager.getRoomStats()
  });
});
```

### Error Tracking:
Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Mixpanel](https://mixpanel.com) for analytics

## Performance Optimization

### Frontend:
- Enable Vite build optimizations
- Use CDN for static assets
- Implement lazy loading

### Backend:
- Add rate limiting
- Implement connection pooling
- Add database for persistence
- Use Redis for session storage

## Scaling Considerations

For high-traffic scenarios:
- Use Redis for Yjs document storage
- Implement horizontal scaling with sticky sessions
- Add load balancing
- Consider microservices architecture

## Custom Domain Setup

### Vercel:
1. Go to project settings
2. Add custom domain
3. Configure DNS records

### Railway:
1. Go to project settings
2. Add custom domain
3. Configure DNS CNAME

## Environment Variables Summary

### Frontend (.env.production):
```
VITE_BACKEND_URL=your-backend-domain.com
VITE_API_URL=https://your-backend-domain.com
```

### Backend (Production):
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
```

## Troubleshooting

### Common Issues:

1. **WebSocket connection fails:**
   - Check CORS configuration
   - Verify HTTPS/WSS for production
   - Confirm environment variables

2. **Real-time collaboration not working:**
   - Check browser console for Yjs errors
   - Verify WebSocket connection in Network tab
   - Test with multiple browser windows

3. **Chat not working:**
   - Check WebSocket connection
   - Verify backend logs for errors
   - Test message sending/receiving

### Debug Commands:

```bash
# Check backend health
curl https://your-backend-domain.com/health

# Check WebSocket connection (using wscat)
npm install -g wscat
wscat -c wss://your-backend-domain.com/chat
```

---

🎉 **Congratulations!** Your Cursor IDE is now deployed and ready for collaborative coding!
