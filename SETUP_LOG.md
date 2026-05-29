# AI Calling Backend - Comprehensive Setup & Progress Log

This document serves as an exhaustive, step-by-step chronological record of the architecture, configurations, and milestones achieved while building the AI Calling Backend. It details *what* was built, *how* it was implemented, and *why* specific architectural decisions were made.

---

## Phase 1: Core Framework & Database Infrastructure

### 1.1 NestJS Framework Bootstrap
- **Action:** Initialized the project using the NestJS CLI (`@nestjs/cli`).
- **Why:** NestJS provides a scalable, modular, and strongly-typed (TypeScript) architecture out-of-the-box, which is critical for maintaining complex routing layers and dependency injection as the application grows.

### 1.2 PostgreSQL & Prisma ORM Integration
- **Action:** Installed `@prisma/client` and `@prisma/adapter-pg`. Configured a local PostgreSQL database.
- **Why:** Relational data is necessary for tracking caller history and analytics accurately. Prisma provides type-safe database access, ensuring that schema changes are automatically reflected in TypeScript.
- **Database Schema (`prisma/schema.prisma`):**
  - `Business`: Stores the tenant/business profile details.
  - `Call`: Logs the caller's phone number, incoming transcript, and the detected intent.
  - `User`: Basic authentication model.
  - `CallAnalytics`: Logs metadata per call (latency, branch executed, tokens consumed).

---

## Phase 2: Intent-Based Routing "Brain"

To minimize API costs and guarantee factual accuracy, we avoided routing all queries directly to an LLM. Instead, we built a deterministic routing engine.

### 2.1 The Orchestrator (`CallsService`)
- **Action:** Created `src/calls/calls.service.ts` to act as the central dispatcher.
- **Flow:** It intercepts HTTP POST payloads, logs the initial call to PostgreSQL, requests an intent classification, and then switches execution to the correct specialized service branch.

### 2.2 Intent Classification (`IntentService`)
- **Action:** Created an evaluation layer that normalizes incoming text and matches keywords to specific execution branches (`Intent.FAQ`, `Intent.WORKFLOW`, or `Intent.UNKNOWN`).

### 2.3 The Execution Branches
1. **FAQ Branch (`FaqService`):**
   - **Mechanism:** Queries a static, local dataset (`src/faq/faq.data.json`).
   - **Benefit:** 0ms LLM latency, 0 token cost, and 100% factual guarantee for standard questions (e.g., "What are your business hours?").
2. **Workflow Branch (`WorkflowsService`):**
   - **Mechanism:** Intercepts transactional intents (e.g., booking an appointment).
   - **Benefit:** Returns structured JSON action steps rather than conversational text, allowing the frontend or telephony provider to trigger UI/API events.
3. **LLM Fallback Branch (`LlmService`):**
   - **Mechanism:** Uses the `openai` SDK configured with `baseURL: 'https://integrate.api.nvidia.com/v1'` to target the **NVIDIA Llama-3.1-8b-instruct** model.
   - **Benefit:** Handles any open-ended conversational query that falls outside FAQ or Workflow rules.

---

## Phase 3: Performance Optimization & Analytics

### 3.1 Redis Caching Layer (`CacheService`)
- **Action:** Installed `ioredis` and integrated it globally via `RedisModule`.
- **Mechanism:** Caches the outputs of `IntentService`. If a user asks "What is the price?", the detected intent is stored in Redis. Subsequent identical questions skip the classification logic and retrieve the intent instantly.
- **Bug Fix applied:** We encountered a 500 Internal Server Error due to `process.env.REDIS_PORT` returning `undefined`, causing a `NaN` port evaluation. We implemented a strict fallback (`process.env.REDIS_PORT ? Number(...) : 6379`) to ensure crash-free boots.

### 3.2 Analytics & Metrics (`AnalyticsService`)
- **Action:** Created a background logging service triggered at the end of `CallsService.create()`.
- **Data Tracked:**
  - `latencyMs`: Calculated via `Date.now() - startTime`.
  - `branch`: Tracks which service handled the call (FAQ vs LLM).
  - `tokenCount`: Captures LLM usage directly from the NVIDIA API response.
- **Reporting:** Exposed `GET /analytics/summary` to return aggregated counts, averages, and total system costs.

---

## Phase 4: Real-Time Audio Infrastructure (WebSockets)

To transition the backend from a text-based HTTP API to a real-time conversational telephony platform, we implemented bi-directional audio streaming.

### 4.1 WebSockets Setup
- **Action:** Installed `@nestjs/websockets`, `@nestjs/platform-socket.io`, and `socket.io`.
- **Implementation:** Created `src/audio/audio.gateway.ts`.
  - Decorated with `@WebSocketGateway({ cors: { origin: '*' } })`.
  - Listens for raw binary `'audio'` events.
  - Maintains an in-memory mapped buffer `Map<string, Buffer[]>` for every connected socket client ID.

### 4.2 Frontend Audio Simulator (`public/index.html`)
- **Action:** Built a vanilla HTML/JS interface to simulate phone calls natively in the browser.
- **Mechanism:**
  - Uses `navigator.mediaDevices.getUserMedia` to access the laptop microphone.
  - Uses `MediaRecorder` to capture the audio stream into chunks.
  - Converts the chunks into raw byte arrays (`ArrayBuffer`) and emits them over the WebSocket connection.
  - Listens for an `'audio-echo'` event from the NestJS server and decodes the returning buffer via the Web Audio API to play the sound through the user's speakers.
- **Serving:** Integrated `@nestjs/serve-static` in `AppModule` pointing to `join(process.cwd(), 'public')` so the simulator is available instantly at `http://localhost:3000`.

---

## Current Architecture Status

The foundational **"Brain"** (Routing, AI, Caching, Analytics) and the **"Transport"** layer (WebSockets, Simulator) are 100% operational and verified. Data successfully flows from a live microphone to the backend buffer and back to the speaker with ultra-low latency.

## Next Phase (Pending Implementation)
1. **Speech-to-Text (STT):** Intercept the buffered raw audio in `AudioGateway` and pipe it through a transcription service (e.g., Deepgram, Whisper) to generate a text `transcript`.
2. **Intent Integration:** Feed the STT transcript into our existing `CallsService` brain.
3. **Text-to-Speech (TTS):** Take the text response generated by the brain (FAQ/LLM) and synthesize it into human audio (e.g., ElevenLabs).
4. **Audio Streaming Return:** Stream the generated TTS audio bytes back across the WebSocket to the caller.
