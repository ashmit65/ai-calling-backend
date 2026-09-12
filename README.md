# AI Calling Backend (Portfolio Project)

A real-time AI Voice Assistant backend built with NestJS. This platform accepts streaming audio over WebSockets, converts it to text, routes the user's intent to either a pre-defined FAQ or a dynamic LLM, and streams synthesized voice responses back to the frontend.

## Architecture

*   **Frontend:** A professional SaaS-style dashboard using vanilla JS and WebSockets.
*   **Backend:** NestJS, TypeScript, Prisma (PostgreSQL), and Redis.
*   **Speech-to-Text (STT):** Deepgram (Nova-2 model).
*   **Intelligence:** 
    *   **Intent Router:** Custom matching engine.
    *   **LLM:** NVIDIA NIM (`nemotron-70b-instruct`) for conversational responses.
*   **Text-to-Speech (TTS):** ElevenLabs (`eleven_flash_v2_5` with "Antoni" voice).

## Prerequisites

1.  Docker & Docker Compose
2.  Node.js v18+
3.  API Keys for Deepgram, NVIDIA NIM, and ElevenLabs.

## Setup Instructions

1.  **Environment Variables**
    Create a `.env` file in the root directory matching `.env.example`, and fill in your keys:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5433/aicalling?schema=public"
    NVIDIA_API_KEY="your-nvidia-key"
    STT_PROVIDER=deepgram
    DEEPGRAM_API_KEY="your-deepgram-key"
    TTS_PROVIDER=elevenlabs
    ELEVENLABS_API_KEY="your-elevenlabs-key"
    ELEVENLABS_MODEL="eleven_flash_v2_5"
    ELEVENLABS_VOICE_ID="ErXwobaYiN019PkySvjV"
    ```

2.  **Start the Databases**
    ```bash
    docker compose up -d
    ```

3.  **Install & Run**
    ```bash
    npm install
    npm run start:dev
    ```

4.  **Test the Application**
    Open your browser and navigate to `http://localhost:3000`. Click "Start Call" to begin speaking with the AI agent!
