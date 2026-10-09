
# LinkUp - Real-Time Chat and Social Platform

LinkUp is a full-stack web application that combines real-time communication and interactive mini-games in one place.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing using bcryptjs

### Real-Time Chat
- Create and join chat rooms
- Real-time messaging using WebSockets
- Message history stored in MongoDB
- Emoji reactions to messages
- Typing indicators
- Online presence and member information
- Room and member sidebar
- Connection status and automatic reconnection

### Games
- Guess the Number against the computer
- Tic-Tac-Toe against the computer
- Interactive game popups

### User Interface
- Modern dashboard
- Dark and light themes
- Blue-accented design
- Dedicated Chat Rooms and Games sections

### Backend and Scalability
- REST APIs using Express.js
- WebSocket communication using ws
- Redis Pub/Sub for distributing events across server instances
- MongoDB for persistent data storage
- Docker Compose for MongoDB and Redis

## Tech Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express.js
- Real-Time Communication: WebSockets (ws)
- Database: MongoDB, Mongoose
- Messaging: Redis Pub/Sub
- Authentication: JWT, bcryptjs
- Containerization: Docker Compose

## Project Structure

- `client/` - Frontend application
- `server/` - Backend application
- `docker-compose.yml` - MongoDB and Redis configuration
- `README.md` - Project documentation

## Getting Started

### Prerequisites

- Node.js and npm
- Docker Desktop
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Poojitha-teella/LinkUp-realtime-project.git
cd linkup-realtime-project
```

### 2. Start MongoDB and Redis

```bash
docker compose up -d
```

### 3. Start the Backend

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` as a reference and configure the required environment variables.

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/pulseroom
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=pulseroom_my_secret_2026
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

Backend: http://localhost:4000

### 4. Start the Frontend

Open another terminal and run:

```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:5173


## Demo Flow

1. Register an account and log in.
2. Create or join a chat room.
3. Open another browser session and log in with another account.
4. Exchange messages and test emoji reactions.
5. Test typing indicators and online presence.
6. Switch between dark and light themes.
7. Play Guess the Number and Tic-Tac-Toe.

## Future Improvements

- File and image sharing
- Message editing and deletion
- User profile customization
- Notifications and unread message counts
- Automated testing and deployment

## Project Purpose

LinkUp demonstrates full-stack development skills, including authentication, database integration, real-time communication, and event distribution using Redis.

**Built with React, Node.js, Express, MongoDB, WebSockets, and Redis.**
