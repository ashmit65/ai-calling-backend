import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
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
    private readonly ttsService: TtsService
  ) {}

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('audio')
  async handleAudio(client: any, payload: any) {
    this.logger.log(`Received audio payload from client: ${client.id}`);
    
    try {
      // 1. Convert incoming raw WebM/Ogg audio to text (STT)
      const audioBuffer = Buffer.from(payload);
      const sttResult = await this.sttService.transcribe(audioBuffer);
      
      this.logger.log(`Transcribed text: "${sttResult.transcript}"`);

      if (!sttResult.transcript || sttResult.transcript.trim() === '') {
        this.logger.warn('Empty transcript received, skipping processing.');
        return;
      }

      // 2. Process the text through the brain (Intent, NLP, and Logging)
      const orchestratorResponse = await this.orchestrator.process({
        phone: client.id, // using client ID as phone number for local testing
        transcript: sttResult.transcript
      });

      this.logger.log(`AI Response: "${orchestratorResponse.text}"`);

      // 3. Synthesize the AI's text response back into speech (TTS)
      const ttsResult = await this.ttsService.synthesize(orchestratorResponse.text);

      // 4. Send the generated AI voice bytes back to the caller
      client.emit('audio-echo', ttsResult.audio);
      
      this.logger.log(`Successfully streamed audio response back to ${client.id}`);
      
    } catch (error: any) {
      this.logger.error(`Error in audio pipeline: ${error.message}`, error.stack);
      // Optional: Emit an error event back to client
      client.emit('audio-error', { message: 'Failed to process audio.' });
    }
  }
}
