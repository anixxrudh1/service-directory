# ServiceDirectory - Deployment Guide

## Project Structure

```
project/
├── servicedir-backend copy/
│   └── servicedir-backend copy/     # Express.js backend
│       ├── models/                  # MongoDB models
│       ├── routes/                  # API routes
│       ├── server.js
│       └── package.json
├── service-directory copy/
│   └── service-directory copy/      # React frontend (Vite)
│       ├── src/
│       ├── vite.config.js
│       └── package.json
├── render.yaml                      # Render deployment config
├── Procfile                         # Process file for deployment
├── build.sh                         # Build script (Unix/Linux/Mac)
└── build.bat                        # Build script (Windows)
```

## Deployment Configuration

### For Render.com

1. **Backend Service:**
   - Type: Web Service (Node.js)
   - Root Directory: `servicedir-backend copy/servicedir-backend copy`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Port: 5001

2. **Frontend Service:**
   - Type: Static Site or Web Service
   - Root Directory: `service-directory copy/service-directory copy`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Environment Variables

**Backend (.env):**
```
NODE_ENV=production
PORT=5001
MONGO_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret
```

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## Local Development

### Install Dependencies
```bash
# Backend
cd "servicedir-backend copy/servicedir-backend copy"
npm install

# Frontend
cd "service-directory copy/service-directory copy"
npm install
```

### Start Development Servers
```bash
# Terminal 1 - Backend (port 5001)
cd "servicedir-backend copy/servicedir-backend copy"
npm run dev

# Terminal 2 - Frontend (port 5173)
cd "service-directory copy/service-directory copy"
npm run dev
```

## Troubleshooting

### Error: "Couldn't find a package.json file in /opt/render/project/src"

**Solution:**
- Ensure render.yaml specifies correct `rootDir` paths
- Use the Procfile configuration
- Verify directory names and paths don't have conflicting spaces
- Check that package.json exists in specified directories

### Build Fails

1. Check that all dependencies are listed in backend/package.json:
   - express
   - mongoose
   - cors
   - stripe
   - pdfkit
   - nodemailer

2. Verify frontend build:
   - `npm run build` works locally
   - dist/ folder is created
   - All imports are correctly resolved

### MongoDB Connection Issues

- Ensure MONGO_URI environment variable is set correctly
- Check that MongoDB service is running and accessible
- Verify IP whitelist if using MongoDB Atlas

## Available Scripts

```bash
npm start         # Start backend server
npm run dev       # Start with nodemon (backend)
npm run build     # Build frontend (from frontend directory)
```

## Security Notes

- Store sensitive keys in Render environment variables
- Use .env files for local development only
- Never commit .env files to repository
- Use different credentials for production
