# Local Service Provider (LSP)

This is a university project for Software Development 2.

## Project Structure
- `development/`: The main Express application.
- `Diagrams/`: Design documents and diagrams.
- `docs/`: Additional documentation.

## Getting Started

### Using Docker (Recommended)
1. Navigate to the `development` directory:
   ```bash
   cd development
   ```
2. Build and start the containers:
   ```bash
   docker compose up --build
   ```
3. Access the application at `http://localhost:3000`.
4. Access phpMyAdmin at `http://localhost:8080`.

### Manual Setup
1. `cd development`
2. `npm install`
3. Setup MySQL database using `db/init.sql`.
4. Configure `.env` from `.env.example`.
5. `npm start` or `npm run dev`.

## Features & Implementation
For a detailed list of implemented features and current status, see [IMPLEMENTATION_STATUS.md](development/IMPLEMENTATION_STATUS.md).
