import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IsttProvider, SttResponse } from '../stt.interface';

@Injectable()
export class DeepgramProvider implements IsttProvider {
  private readonly logger = new Logger(DeepgramProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async transcribe(audioBuffer: Buffer, mimeType?: string): Promise<SttResponse> {
    const apiKey = this.configService.get<string>('DEEPGRAM_API_KEY') || this.configService.get<string>('DEEPGRAM_API');
    if (!apiKey) {
      this.logger.error('Deepgram API Key is not configured (DEEPGRAM_API_KEY is missing).');
      throw new InternalServerErrorException('STT service configuration error: Missing credentials.');
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new BadRequestException('Invalid audio input: audio buffer is empty.');
    }

    const model = this.configService.get<string>('DEEPGRAM_MODEL', 'nova-2');
    const language = this.configService.get<string>('DEEPGRAM_LANGUAGE', 'en');
    const smartFormat = this.configService.get<string>('DEEPGRAM_SMART_FORMAT', 'true');

    // Build query parameters
    const params = new URLSearchParams({
      model,
      language,
      smart_format: smartFormat,
    });

    const contentType = mimeType || 'application/octet-stream';
    const url = `https://api.deepgram.com/v1/listen?${params.toString()}`;

    this.logger.log(`Initiating transcription request with model=${model}, language=${language}`);

    try {
      const response = await axios.post(url, audioBuffer, {
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': contentType,
        },
        timeout: 10000, // 10 seconds timeout
      });

      const alternatives = response.data?.results?.channels?.[0]?.alternatives?.[0];
      const transcript = alternatives?.transcript ?? '';
      const confidence = alternatives?.confidence;
      const duration = response.data?.metadata?.duration;
      const responseLanguage = response.data?.results?.channels?.[0]?.detected_language || language;

      return {
        transcript,
        metadata: {
          provider: 'deepgram',
          confidence,
          language: responseLanguage,
          duration,
          model,
        },
      };
    } catch (error: any) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.err_msg || error.message;
      this.logger.error(`Deepgram transcription failed: Status=${status}, Message=${errorMsg}`);

      if (status === 401 || status === 403) {
        throw new InternalServerErrorException('Authentication failure with STT provider.');
      } else if (status === 400) {
        throw new BadRequestException(`Bad request to STT provider: ${errorMsg}`);
      }

      throw new InternalServerErrorException(`STT transcription failed: ${errorMsg}`);
    }
  }
}
