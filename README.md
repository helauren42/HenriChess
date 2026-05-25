# HenriChess

A modern **web-based chess platform** where you can play against friends, random opponents online or enjoy hotseat (local same device) mode.

I built it as a learning full-stack personal project with performant clean code and real-time gameplay.

**You can watch a video of me using the platform on the home page of the website** https://chess.henri10x.dev/

## Features

- **Online multiplayer** — play against other users in real time
- **Hotseat mode** — play on a single device
- **Automated chess timer** automated designated winner when time runs out for opposition player
- **In-game chat** — send messages to your opponent during the match(like trash talk :D)
- **Game history** — view player games history, rewatch past games, browse through positions and learn from your past games
- **Spectator mode** — watch other active online games
- **Responsive design** - works on desktop and mobile browsers

## Tech stack

**Frontend**
- TypeScript + React
- Tailwind CSS

**Backend**
- Python + FastAPI
- PostgreSQL — persistent storage for users and completed games
- Redis — real-time game data
- Caddy — serves static files and forwards requests

**Protocols**
- HTTP/HTTPS - REST API
- WebSocket - matchmaking, game moves, timer updates and chat

