import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { STT_PROVIDER_TOKEN } from './stt.interface';
import { DeepgramProvider } from './providers/deepgram.provider';
import { SttService } from './stt.service';
import { SttController } from './stt.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SttController],
  providers: [
    DeepgramProvider,
    SttService,
    {
      provide: STT_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService, deepgramProvider: DeepgramProvider) => {
        const provider = configService.get<string>('STT_PROVIDER', 'deepgram').toLowerCase();
        if (provider === 'deepgram') {
          return deepgramProvider;
        }
        // Add future provider logic here, e.g.:
        // if (provider === 'whisper') return whisperProvider;
        throw new Error(`Unsupported STT provider: "${provider}" configured.`);
      },
      inject: [ConfigService, DeepgramProvider],
    },
  ],
  exports: [SttService],
})
export class SttModule {}
