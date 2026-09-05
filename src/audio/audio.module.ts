import { Module } from '@nestjs/common';
import { AudioGateway } from './audio.gateway';
import { SttModule } from '../media/stt/stt.module';
import { TtsModule } from '../media/tts/tts.module';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';

@Module({
  imports: [SttModule, TtsModule, OrchestratorModule],
  providers: [AudioGateway],
})
export class AudioModule {}
