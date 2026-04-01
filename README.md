# Local Service Provider (LSP)

This is a university project for Software Development 2.

## Project Structure
- `/`: The main Express application (controllers, models, routes, views).
- `Diagrams/`: Design documents and diagrams.
- `docs/`: Additional documentation.

## Getting Started

### Using Docker (Recommended)
1. Build and start the containers from the root directory:
   ```bash
   docker compose up --build
   ```
2. Access the application at `http://localhost:3000`.
3. Access phpMyAdmin at `http://localhost:8080`.

### Manual Setup
1. `npm install`
2. Setup MySQL database using `db/init.sql`.
3. Configure `.env` from `.env.example`.
4. `npm start` or `npm run dev`.

## Features & Implementation
For a detailed list of implemented features and current status, see [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).
