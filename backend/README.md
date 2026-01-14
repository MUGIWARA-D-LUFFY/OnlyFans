# Backend API

NestJS backend for OnlyFans.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Start development server:
```bash
npm run start:dev
```

## Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── creators/       # Creator profiles
├── subscriptions/  # Subscription management
├── posts/          # Content posts
├── messages/       # Messaging with WebSocket
├── payments/       # Payment processing
├── admin/          # Admin moderation
└── prisma/         # Prisma service
```

## API Documentation

See main README.md for API endpoints.

## Database

Uses Prisma ORM with PostgreSQL. Schema is defined in `prisma/schema.prisma`.

## Environment Variables

See `.env.example` for required variables.


