# OnlyFans

A full-stack adult content subscription platform built with Next.js, NestJS, PostgreSQL, and Redis.

## 🚀 Deployment

**Recommended Setup**: 
- **Backend**: Render (includes free PostgreSQL)
- **Frontend**: Vercel (optimized for Next.js)

📖 **[Complete Deployment Guide →](./HYBRID_DEPLOY.md)**

Quick Deploy:
- Backend on Render: See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
- Frontend on Vercel: See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- Full Guide: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Architecture

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS, Zustand
- **Backend**: NestJS with TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Cache/Sessions**: Redis
- **Real-time**: WebSocket (Socket.io)
- **Authentication**: JWT with refresh tokens

## Features

### User Features
- User registration and authentication
- Age verification (18+ gate)
- Browse and subscribe to creators
- View subscription-based content feed
- Real-time messaging with paid messages
- Profile management

### Creator Features
- Creator profile creation
- Content upload (images/videos)
- Subscription fee management
- Earnings dashboard
- Subscriber management
- Paid content (PPV) support

### Admin Features
- User management
- Content moderation
- Platform statistics
- Reports system

## Project Structure

```
OnlyFans/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
├── docs/              # Documentation
└── docker-compose.yml # Docker services configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Installation

1. Clone the repository

2. Start Docker services:
```bash
docker-compose up -d
```

3. Set up the backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

4. Set up the frontend:
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/adult_platform?schema=public"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/verify-age` - Verify age (18+)
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile

### Users
- `GET /users/me` - Get own profile
- `GET /users/profile/:username` - Get user profile by username
- `PUT /users/me` - Update own profile

### Creators
- `POST /creators` - Create creator profile
- `GET /creators/:id` - Get creator profile
- `GET /creators/username/:username` - Get creator by username
- `PUT /creators/me` - Update own creator profile
- `GET /creators/:id/earnings` - Get creator earnings

### Subscriptions
- `POST /subscriptions/:creatorId` - Subscribe to creator
- `DELETE /subscriptions/:creatorId` - Unsubscribe from creator
- `GET /subscriptions` - Get user subscriptions

### Posts
- `GET /posts/feed` - Get subscription feed
- `GET /posts/:id` - Get single post
- `GET /posts/creator/:creatorId` - Get creator posts
- `POST /posts/creator/:creatorId` - Create post (creator only)
- `DELETE /posts/:id` - Delete post

### Messages
- `POST /messages` - Send message
- `GET /messages/conversations` - Get user conversations
- `GET /messages/conversation/:otherUserId` - Get conversation
- `PUT /messages/:messageId/read` - Mark message as read

### Payments
- `POST /payments/subscribe/:creatorId` - Process subscription payment
- `POST /payments/tip/:creatorId` - Send tip
- `POST /payments/ppv/:postId` - Purchase PPV content
- `POST /payments/message/:messageId` - Purchase paid message
- `GET /payments/transactions` - Get user transactions

### Admin
- `GET /admin/dashboard` - Get platform statistics
- `GET /admin/users` - Get all users
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/posts` - Get all posts
- `DELETE /admin/posts/:id` - Delete post

## Security Features

- JWT authentication with refresh tokens
- Age verification required
- Role-based access control (USER, CREATOR, ADMIN)
- Rate limiting (Redis-based)
- Signed media URLs (to be implemented with cloud storage)
- Watermarking (to be implemented)
- CORS protection
- Input validation

## Payment Integration

The platform is designed to integrate with adult-friendly payment processors:
- CCBill
- Segpay
- Paxum

Payment webhook endpoints are ready for integration.

## Media Storage

Configure cloud storage (Cloudflare R2 or AWS S3) for media files:
- Signed URLs for secure access
- Time-limited URLs
- Watermarking support

## Development

### Backend
```bash
cd backend
npm run start:dev
```

### Frontend
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev
npx prisma studio  # Open Prisma Studio
```

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Backend (Railway/Render)
1. Connect GitHub repository
2. Set environment variables
3. Configure database connection
4. Deploy

### Database
- Use managed PostgreSQL service
- Configure connection strings

### Media Storage
- Set up Cloudflare R2 or AWS S3
- Configure bucket and credentials
- Update environment variables

## License

Private - All rights reserved

## Notes

- This is a template/starting point for OnlyFans platform
- Payment gateway integration needs to be completed
- Media storage integration needs to be completed
- Watermarking service needs to be implemented
- Additional security measures should be added for production


