import { Injectable, Inject } from '@nestjs/common';
import { STT_PROVIDER_TOKEN } from './stt.interface';
import type { IsttProvider, SttResponse } from './stt.interface';

@Injectable()
export class SttService {
  constructor(
    @Inject(STT_PROVIDER_TOKEN) private readonly provider: IsttProvider,
  ) {}

  /**
   * Transcribes raw audio buffer to text with metadata.
   * @param audio Buffer containing the audio bytes
   * @param mimeType Optional MIME type of the audio format (e.g. 'audio/wav')
   */
  async transcribe(audio: Buffer, mimeType?: string): Promise<SttResponse> {
    return this.provider.transcribe(audio, mimeType);
  }
}
