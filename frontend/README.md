# Frontend Application

Next.js frontend for OnlyFans.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
app/
├── auth/           # Authentication pages
├── feed/           # Content feed
├── profile/        # User profiles
├── subscribe/     # Subscription pages
├── messages/       # Messaging interface
├── settings/       # User settings
├── creator/        # Creator dashboard
└── admin/          # Admin interface

components/         # Reusable components
services/           # API services
store/              # Zustand state management
utils/              # Utility functions
```

## Features

- Age verification gate
- User authentication
- Content feed with subscriptions
- Real-time messaging
- Creator dashboard
- Admin panel

## Styling

Uses Tailwind CSS with custom blue theme defined in `styles/theme.css`.

## State Management

Uses Zustand for state management:
- `auth.store.ts` - Authentication state
- `user.store.ts` - User profile state
- `post.store.ts` - Post/feed state
