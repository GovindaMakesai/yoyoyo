# YoYo Backend API

Production-ready modular backend for a social voice chat app.

## Folder Structure

- `src/config` - DB and server config
- `src/models` - MongoDB schemas
- `src/controllers` - business logic
- `src/routes` - HTTP routes
- `src/middleware` - auth, rate limit, errors
- `src/services` - shared services (wallet transactions)
- `src/sockets` - Socket.io realtime logic
- `src/utils` - helpers (auth, noble)

## Environment

Copy `.env.example` to `.env`.

Required:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Key APIs (examples)

### Auth
- `POST /auth/register`
```json
{ "name": "Reyan", "email": "a@b.com", "password": "secret123" }
```
- `POST /auth/login`
- `POST /auth/otp/request`
```json
{ "channel": "phone", "identifier": "+919999999999" }
```
- `POST /auth/otp/verify`
```json
{ "channel": "phone", "identifier": "+919999999999", "code": "123456", "name": "Reyan" }
```

### Rooms
- `POST /rooms`
- `POST /rooms/:roomId/join`
- `PATCH /rooms/:roomId/settings`
- `DELETE /rooms/:roomId/members/:userId`
- `GET /rooms/:roomId/messages`

### Wallet / Coins
- `POST /wallet/daily-reward/claim`
- `POST /wallet/add`
- `POST /wallet/spend`
- `GET /wallet/transactions`

### Razorpay
- `GET /payments/coin-packs`
- `POST /payments/coin-order`
- `POST /payments/coin-verify`
- `GET /vip/plans`
- `POST /vip/order`
- `POST /vip/verify`

### Game
- `POST /games/:roomId/lucky-rounds`
- `POST /games/:roomId/lucky-rounds/:roundId/bets`
- `POST /games/:roomId/lucky-rounds/:roundId/settle`

### Admin
- `GET /admin/rooms`
- `POST /admin/users/:userId/ban`
- `POST /admin/users/:userId/unban`
- `POST /admin/users/:userId/coins`

## Socket Events

Client -> Server:
- `joinRoom`
- `leaveRoom`
- `sendMessage`
- `room:broadcast`
- `room:toggleLock`
- `room:updateSettings`
- `typing`

Server -> Client:
- `roomUsersUpdated`
- `messageReceived`
- `typingUpdated`
- `room:stateUpdated`
- `room:error`
