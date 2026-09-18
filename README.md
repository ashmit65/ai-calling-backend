# VoxAI - Real-Time AI Voice Assistant Backend

![CI/CD Pipeline](https://github.com/ashmit65/ai-calling-backend/actions/workflows/ci.yml/badge.svg)
![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)
![Redis](https://img.shields.io/badge/Redis-Cache%20%26%20Queue-DC382D?logo=redis)

**VoxAI** is an enterprise-grade real-time AI Voice Assistant backend built with NestJS, WebSockets, Deepgram, ElevenLabs, and NVIDIA NIM LLM. The platform accepts streaming audio over WebSockets, converts it to text, routes the user's intent to an automated FAQ matcher or dynamic LLM, and streams synthesized voice back to the caller in real time.

---

## 🏗️ Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Client / Mic
    participant WS as Audio Gateway (WebSocket)
    participant STT as Deepgram STT (Nova-2)
    participant Orch as Conversation Orchestrator
    participant Intent as Intent Classifier
    participant FAQ as FAQ Engine
    participant LLM as NVIDIA NIM (Llama 3.2)
    participant TTS as ElevenLabs TTS (Flash v2.5)
    participant DB as PostgreSQL & Redis

    User->>WS: Stream Audio Chunks (5s window)
    WS->>STT: Transcribe Audio Buffer
    STT-->>WS: Return Transcribed Text
    WS->>User: Emit 'user-text' Event
    WS->>Orch: Process Transcript
    Orch->>DB: Log Call Session
    Orch->>Intent: Classify Intent & Confidence
    alt Intent == FAQ (High Confidence)
        Orch->>FAQ: Match Pre-defined FAQ
        FAQ-->>Orch: Return FAQ Answer
    else Intent == General Conversation
        Orch->>LLM: Generate Response
        LLM-->>Orch: Return AI Text
    end
    Orch->>DB: Record Analytics & Latency
    Orch-->>WS: Return Final Response Text
    WS->>TTS: Synthesize Audio Response
    TTS-->>WS: Return MP3 Audio Buffer
    WS->>User: Emit 'ai-text' & 'audio-echo'
    User->>User: Play Voice Response in Browser
```

---

## 🚀 Key Features

- **Real-Time WebSocket Gateway**: High-throughput duplex WebSocket audio streaming.
- **Deepgram Nova-2 STT**: Accurate speech-to-text transcription with smart formatting.
- **Intent Router & Decision Engine**: Automatically determines whether to route to a instant FAQ answer or a dynamic LLM response.
- **NVIDIA NIM LLM**: Powered by `meta/llama-3.2-11b-vision-instruct` for fast, natural conversation.
- **ElevenLabs Flash v2.5 TTS**: Ultra-low latency voice synthesis using default voice IDs (Antoni).
- **PostgreSQL & Prisma ORM**: Call session logging, transcripts, and analytics tracking.
- **Redis Cache & BullMQ**: Caching intent queries and background task queueing.
- **Automated CI/CD Pipeline**: GitHub Actions workflow running automated linting, unit tests, and TypeScript compilation checks on every commit.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | NestJS 11 (TypeScript) |
| **WebSockets** | Socket.io / `@nestjs/websockets` |
| **Speech-to-Text** | Deepgram API (`nova-2`) |
| **Intelligence** | NVIDIA NIM API (`meta/llama-3.2-11b-vision-instruct`) |
| **Text-to-Speech** | ElevenLabs API (`eleven_flash_v2_5`, Voice: `ErXwobaYiN019PkySvjV`) |
| **Database** | PostgreSQL + Prisma ORM |
| **Caching/Queue** | Redis + BullMQ |
| **CI/CD** | GitHub Actions |

---

## ⚙️ Prerequisites

- **Node.js**: `v20.x` or higher
- **Docker & Docker Compose**: For local PostgreSQL and Redis containers
- **API Keys**:
  - [Deepgram API Key](https://deepgram.com/)
  - [ElevenLabs API Key](https://elevenlabs.io/)
  - [NVIDIA NIM API Key](https://build.nvidia.com/)

---

## 💻 Local Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ashmit65/ai-calling-backend.git
cd ai-calling-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Database & Redis
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/aicalling?schema=public"

# NVIDIA NIM LLM
NVIDIA_API_KEY="your-nvidia-api-key"

# Deepgram Speech-to-Text
STT_PROVIDER=deepgram
DEEPGRAM_API_KEY="your-deepgram-api-key"
DEEPGRAM_MODEL=nova-2
DEEPGRAM_LANGUAGE=en

# ElevenLabs Text-to-Speech
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
ELEVENLABS_MODEL="eleven_flash_v2_5"
ELEVENLABS_VOICE_ID="ErXwobaYiN019PkySvjV"
ELEVENLABS_OUTPUT_FORMAT="mp3_44100_128"
```

### 3. Start Database Containers & Run Migrations
```bash
# Start PostgreSQL (port 5433) and Redis (port 6379)
docker compose up -d

# Generate Prisma Client & Push DB Schema
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```

Open `http://localhost:3000` in your browser to access the **VoxAI Voice Call Simulator**!

---

## 🔄 CI/CD Pipeline

This project includes a complete **GitHub Actions CI/CD Pipeline** defined in `.github/workflows/ci.yml`.

### Automated Steps on `git push`:
1. **Checkout & Node Setup**: Sets up Node.js 20 with npm caching.
2. **Dependency Resolution**: Runs `npm install` for cross-platform binary compatibility.
3. **Prisma Generation**: Generates TypeScript client types (`npx prisma generate`).
4. **Code Quality**: Runs `npm run lint` with ESLint rules.
5. **Unit Tests**: Runs Jest test suite (`npm test`).
6. **Build Compilation**: Verifies clean production TypeScript compilation (`npm run build`).

---

## 📄 License

This project is licensed under the [UNLICENSED](LICENSE) license for portfolio and educational use.
