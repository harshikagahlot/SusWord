# 🕵️ SusWord

A real-time multiplayer social deduction word game built with React, Node.js, and Socket.IO.

## 🎯 Concept
**SusWord** is a fast-paced hidden-role game where 3-8 players must find the "Imposter" among them. 
- At the start of a round, everyone receives the same Secret Word (e.g., "Sunset").
- One player (the Imposter) receives a subtly different word (e.g., "Sunrise").
- Players take turns giving a one-word clue about their secret word.
- After all clues are given, players vote on who they think is the Imposter.
- If the Imposter is caught, they get one final chance to steal the win by guessing the Civilians' actual word!

## ✨ Key Features
- **Real-Time Multiplayer:** Instant room creation, joining, and synchronized game states.
- **Server-Authoritative Architecture:** The backend acts as the single source of truth, preventing client-side cheating and desyncs.
- **Robust Replay System:** Play multiple rounds seamlessly within the same room without needing to reconnect.
- **Disconnect Resilience:** The game gracefully handles players leaving mid-round, auto-advancing turns and reassigning the Host role if necessary.
- **Responsive & Premium UI:** Built with Tailwind CSS, featuring modern glassmorphism, fluid animations, and a sleek dark mode.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Real-time Engine:** Socket.IO
- **Architecture:** Client-Server model with a centralized, in-memory state manager.

## 📂 Project Structure
The repository is structured as a monorepo containing two main directories:

```text
SusWord/
├── client/         # React frontend application
│   ├── src/        
│   │   ├── components/  # Reusable UI elements
│   │   ├── context/     # GameContext (Socket listener & State reducer)
│   │   ├── hooks/       # useSocket (Connection manager)
│   │   └── pages/       # Game phase screens (Lobby, Reveal, Voting, etc.)
│   └── .env.example     # Client environment variables
├── server/         # Node.js + Socket.IO backend
│   ├── src/
│   │   ├── index.js     # Socket event mappings & Express setup
│   │   ├── gameManager.js # Core game logic (word pairs, voting, scoring)
│   │   ├── roomManager.js # Room connection and lifecycle management
│   │   └── utils.js     # Helpers (e.g., Room code generation)
│   └── .env.example     # Server environment variables
└── shared/         # Shared constants across both environments
```

## 🚀 How to Run Locally

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:3001`.

### 2. Start the Frontend
Open a **new** terminal window:
```bash
cd client
npm install
npm run dev
```
The client will be available at `http://localhost:5173`. Open this URL in multiple browser tabs to simulate multiple players!

## ⚙️ Environment Variables & Deployment

Both the frontend and backend are ready to be deployed independently.

### Frontend (`client/.env`)
Create a `.env` file based on `.env.example`:
```env
VITE_SERVER_URL=https://your-deployed-backend.com
```

### Backend (`server/.env`)
Create a `.env` file based on `.env.example`:
```env
# Comma-separated list of allowed frontend domains
ALLOWED_ORIGINS=https://your-deployed-frontend.com
```

## 🧠 Why Socket.IO?
Socket.IO was chosen over pure WebSockets or polling because it provides:
1. **Automatic Reconnection:** Handles temporary network drops gracefully.
2. **Rooms & Broadcasting:** Native support for grouping sockets into "Rooms" (e.g., `io.to(roomCode).emit()`), which drastically simplifies multiplayer session management.
3. **Fallback Transports:** Ensures connectivity even on strict networks that block WebSockets.

## ⚠️ Current MVP Limitations
- **In-Memory State:** Rooms are stored in the Node.js server's RAM. If the server restarts or crashes, active rooms are lost. (A future update could integrate Redis for persistent state).
- **No Authentication:** Players join with a temporary display name. There are no persistent user accounts or global leaderboards.

## 🔮 Future Improvements
- Advanced game settings (custom timers, word categories).
- Redis integration for scalable room persistence.
- "Spectator Mode" for players joining late.

---
*Live Demo: [Coming Soon]*
*Demo Video: [Coming Soon]*
