# AuctionApp Backend

Node.js + Express + MongoDB + Socket.io backend for the AuctionApp project.

## Stack
- Express API (TypeScript)
- MongoDB + Mongoose
- JWT auth + role-based middleware
- Socket.io for real-time auction updates

## Quick Start
1. Copy `.env.example` to `.env` and set values.
2. Install dependencies:
   - `npm install`
3. Seed demo data:
   - `npm run seed`
4. Start dev server:
   - `npm run dev`

Server default: `http://localhost:5000`

## API Base
- `/api/v1/auth`
- `/api/v1/auctions`
- `/api/v1/teams`
- `/api/v1/players`
- `/api/v1/bids`

## Socket.io Events
Client emit:
- `auction:join` with `auctionId`
- `auction:leave` with `auctionId`

Server emit:
- `bid:placed`

## Demo Auth Users (after seed)
- `admin@auction.com / admin123`
- `org@auction.com / org123`
- `bidder@auction.com / bidder123`
- `player@auction.com / player123`
