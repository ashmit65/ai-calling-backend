import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ITtsProvider, TtsResponse } from '../tts.interface';

@Injectable()
export class ElevenLabsProvider implements ITtsProvider {
  private readonly logger = new Logger(ElevenLabsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async synthesize(text: string): Promise<TtsResponse> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestException('Text input to TTS synthesis cannot be empty.');
    }

    const apiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    if (!apiKey) {
      this.logger.error('ElevenLabs API Key is not configured (ELEVENLABS_API_KEY is missing).');
      throw new InternalServerErrorException('TTS service configuration error: Missing credentials.');
    }

    const voiceId = this.configService.get<string>('ELEVENLABS_VOICE_ID', '21m00Tcm4TlvDq8ikWAM'); // Rachel (default)
    const model = this.configService.get<string>('ELEVENLABS_MODEL', 'eleven_monolingual_v1');
    const outputFormat = this.configService.get<string>('ELEVENLABS_OUTPUT_FORMAT', 'mp3_44100_128');

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${outputFormat}`;
    this.logger.log(`Synthesizing text: "${text.substring(0, 30)}..." using voice=${voiceId}, model=${model}`);

    try {
      const response = await axios.post(
        url,
        {
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 10000,
        },
      );

      const audioBuffer = Buffer.from(response.data);

      return {
        audio: audioBuffer,
        metadata: {
          provider: 'elevenlabs',
          model,
          voice: voiceId,
          format: outputFormat,
        },
      };
    } catch (error: any) {
      const status = error.response?.status;
      let errorMsg = error.message;

      // Try to parse arraybuffer error response if possible
      if (error.response?.data && error.response.data instanceof Buffer) {
        try {
          const parsedError = JSON.parse(error.response.data.toString());
          errorMsg = parsedError.detail?.message || errorMsg;
        } catch {
          // ignore parsing error, stick to basic error message
        }
      }

      this.logger.error(`ElevenLabs synthesis failed: Status=${status}, Message=${errorMsg}`);

      if (status === 401 || status === 403) {
        throw new InternalServerErrorException('Authentication failure with ElevenLabs TTS.');
      } else if (status === 400) {
        throw new BadRequestException(`Bad request to ElevenLabs TTS: ${errorMsg}`);
      }

      throw new InternalServerErrorException(`TTS synthesis failed: ${errorMsg}`);
    }
  }
}
