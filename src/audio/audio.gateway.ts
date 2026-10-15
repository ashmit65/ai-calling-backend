import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SttService } from '../media/stt/stt.service';
import { TtsService } from '../media/tts/tts.service';
import { ConversationOrchestrator } from '../orchestrator/orchestrator.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class AudioGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AudioGateway.name);

  constructor(
    private readonly sttService: SttService,
    private readonly orchestrator: ConversationOrchestrator,
    private readonly ttsService: TtsService,
  ) {}

  handleConnection(client: any) {
    const expectedKey = process.env.API_KEY;
    if (expectedKey) {
      const clientKey =
        client.handshake?.auth?.apiKey ||
        client.handshake?.headers?.['x-api-key'] ||
        client.handshake?.query?.apiKey;

      if (clientKey !== expectedKey) {
        this.logger.warn(
          `Unauthorized WebSocket connection rejected: ${client.id}`,
        );
        client.disconnect(true);
        return;
      }
    }
    this.logger.log(`Client authenticated & connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('audio')
  async handleAudio(client: any, payload: any) {
    this.logger.log(`Received audio payload from client: ${client.id}`);
    let stage: 'transcription' | 'conversation' | 'speech' = 'transcription';

    try {
      // 1. Convert incoming raw WebM/Ogg audio to text (STT)
      const audioBuffer = Buffer.from(payload);
      const sttResult = await this.sttService.transcribe(audioBuffer);

      this.logger.log(`Transcribed text: "${sttResult.transcript}"`);

      if (!sttResult.transcript || sttResult.transcript.trim() === '') {
        this.logger.warn('Empty transcript received, skipping processing.');
        client.emit('audio-error', {
          stage,
          message: 'No speech was detected. Try again and speak clearly.',
        });
        return;
      }

      // Send what the user said back to the frontend UI
      client.emit('user-text', sttResult.transcript);

      // 2. Process the text through the brain (Intent, NLP, and Logging)
      stage = 'conversation';
      const orchestratorResponse = await this.orchestrator.process({
        phone: client.id, // using client ID as phone number for local testing
        clientId: client.handshake?.auth?.clientId || process.env.DEFAULT_CLIENT_ID || 'default',
        transcript: sttResult.transcript,
      });

      this.logger.log(`AI Response: "${orchestratorResponse.text}"`);
      client.emit('ai-text', orchestratorResponse.text);

      // 3. Synthesize the AI's text response back into speech (TTS)
      stage = 'speech';
      const ttsResult = await this.ttsService.synthesize(
        orchestratorResponse.text,
      );

      // 4. Send the generated AI voice bytes back to the caller
      client.emit('audio-echo', ttsResult.audio);

      this.logger.log(
        `Successfully streamed audio response back to ${client.id}`,
      );
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Audio pipeline failed during ${stage}: ${details}`,
        stack,
      );

      const message =
        stage === 'speech'
          ? 'Your text reply is ready, but speech audio could not be generated. Check the backend logs.'
          : stage === 'conversation'
            ? 'Your speech was transcribed, but the system could not process it. Check the backend logs.'
            : 'Speech could not be transcribed. Check the backend logs.';
      client.emit('audio-error', { stage, message });
    }
  }
}
