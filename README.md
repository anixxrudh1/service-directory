# ServiceDirectory - Service Discovery Platform

A full-stack web application for discovering and booking services. Built with React (Vite) frontend and Node.js/Express backend.

## Project Structure

```
project/
├── servicedir-backend copy/
│   └── servicedir-backend copy/          # Backend Node.js server
│       ├── models/                       # MongoDB data models
│       ├── routes/                       # API endpoints
│       ├── server.js                     # Express app entry point
│       ├── package.json
│       └── .env.example
├── service-directory copy/
│   └── service-directory copy/           # Frontend React app
│       ├── src/
│       │   ├── pages/                    # Page components
│       │   ├── components/               # Reusable components
│       │   ├── context/                  # Auth context
│       │   └── App.jsx
│       ├── vite.config.js
│       ├── package.json
│       └── .env.example
├── render.yaml                           # Render deployment config
├── Procfile                              # Heroku/Render process file
└── render-build.sh                       # Custom build script
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB running locally or connection string

### Backend Setup
```bash
cd "servicedir-backend copy/servicedir-backend copy"
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other config
npm run dev
# Backend runs on http://localhost:5001
```

### Frontend Setup
```bash
cd "service-directory copy/service-directory copy"
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
# Frontend runs on http://localhost:5173
```

## Deployment

### Deploy on Render.com

#### Option 1: Using render.yaml
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repo
5. Render automatically detects `render.yaml` and deploys both services

#### Option 2: Manual Setup via UI
**Backend (Web Service):**
- Root Directory: `servicedir-backend copy/servicedir-backend copy`
- Build Command: `npm ci --omit=dev`
- Start Command: `npm start`
- Environment Variables:
  - `NODE_ENV`: production
  - `MONGO_URI`: your MongoDB connection string
  - `STRIPE_SECRET_KEY`: your Stripe secret key

**Frontend (Static Site):**
- Root Directory: `service-directory copy/service-directory copy`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/serviceDirDB
STRIPE_SECRET_KEY=sk_live_your_key
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (provider only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:userId` - Get user bookings
- `PUT /api/bookings/:id` - Update booking status

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history/:userId` - Payment history

### Wallets
- `GET /api/wallets/:userId` - Get wallet
- `POST /api/wallets/:userId/add-funds` - Add funds
- `POST /api/wallets/:userId/deduct` - Deduct amount

### Invoices
- `GET /api/invoices/user/:userId` - Get user invoices
- `GET /api/invoices/:invoiceId/pdf` - Download invoice PDF

## Features

✅ User authentication (sign up/sign in)
✅ Service browsing and search
✅ Service bookings
✅ Payment processing with Stripe
✅ Wallet system for balance management
✅ Invoice generation and PDF download
✅ User reviews and ratings
✅ Admin dashboard
✅ Business profile management
✅ Responsive design with Tailwind CSS

## Technologies

**Frontend:**
- React 19
- Vite
- React Router
- Tailwind CSS
- Lucide React icons

**Backend:**
- Node.js / Express
- MongoDB
- Mongoose
- Stripe API
- JWT authentication
- PDFKit for invoice generation

## Troubleshooting

### "Couldn't find package.json in /opt/render/project/src"
- Ensure render.yaml has correct `rootDir` paths
- Paths should be: `servicedir-backend copy/servicedir-backend copy`
- Use quotes in YAML for paths with spaces

### Build fails on Render
- Check that all dependencies are installed locally first: `npm install`
- Verify `npm run build` works locally
- Check .env variables are set correctly

### MongoDB connection fails
- Verify connection string in `MONGO_URI`
- Check IP is whitelisted if using MongoDB Atlas
- Ensure database exists

## License

ISC

## Support

For issues or questions, please check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for more details.
