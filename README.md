# GlazeBot

GlazeBot is a playful Expo chat app with two personalities:

- **GlazeBot**: an over-the-top hype companion for quick confidence boosts.
- **RealBot**: a blunt but supportive reality-check mode.

The mobile/web client is built with React Native and Expo. A small Express proxy keeps the Groq API key on the server, applies rate limiting, validates chat requests, and forwards approved prompts to Groq's OpenAI-compatible chat completions API.

## Why This Project Matters

This repo demonstrates:

- React Native UI state management with animated details and mode-specific styling.
- A lightweight Node/Express backend for protecting provider credentials.
- Practical API hardening: rate limiting, CORS configuration, request validation, and server-side secrets.
- Deployment-friendly configuration through environment variables.

## Tech Stack

- Expo / React Native
- React Native Web
- Node.js and Express
- Groq chat completions API
- Railway-compatible backend deployment

## Project Structure

```text
.
├── App.js              # Expo client
├── app.json            # Expo app configuration
├── assets/             # App icons and splash assets
├── server/
│   ├── index.js        # Express API proxy
│   └── package.json
└── package.json
```

## Local Setup

Install client dependencies:

```bash
npm install
```

Install server dependencies:

```bash
cd server
npm install
```

Create server environment variables:

```bash
cp server/.env.example server/.env
```

Set `GROQ_API_KEY` in your server environment, then run the API:

```bash
cd server
npm start
```

In another terminal, point the Expo client at the local server:

```bash
set EXPO_PUBLIC_API_URL=http://localhost:3000
npm start
```

On macOS/Linux, use:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm start
```

## Environment Variables

Client:

- `EXPO_PUBLIC_API_URL`: Base URL for the backend, without `/chat`.

Server:

- `GROQ_API_KEY`: Groq API key. Required.
- `CLIENT_ORIGIN`: Optional comma-separated list of allowed browser origins.
- `PORT`: Optional server port. Defaults to `3000`.

## Security Notes

- API keys must only be set on the server. Do not put provider keys in `App.js`, Expo public config, or generated web bundles.
- Generated build output, Expo local state, local assistant settings, and `.env` files are ignored by Git.
- If a key is ever committed, revoke it with the provider and rewrite Git history before making the repository public.
