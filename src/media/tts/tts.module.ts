import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TTS_PROVIDER_TOKEN } from './tts.interface';
import { ElevenLabsProvider } from './providers/elevenlabs.provider';
import { TtsService } from './tts.service';
import { TtsController } from './tts.controller';

@Module({
  imports: [ConfigModule],
  controllers: [TtsController],
  providers: [
    ElevenLabsProvider,
    TtsService,
    {
      provide: TTS_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService, elevenLabsProvider: ElevenLabsProvider) => {
        const provider = configService.get<string>('TTS_PROVIDER', 'elevenlabs').toLowerCase();
        if (provider === 'elevenlabs') {
          return elevenLabsProvider;
        }
        // Add future provider logic here, e.g.:
        // if (provider === 'kokoro') return kokoroProvider;
        throw new Error(`Unsupported TTS provider: "${provider}" configured.`);
      },
      inject: [ConfigService, ElevenLabsProvider],
    },
  ],
  exports: [TtsService],
})
export class TtsModule {}
