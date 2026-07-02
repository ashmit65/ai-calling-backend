import { Injectable, Inject } from '@nestjs/common';
import { TTS_PROVIDER_TOKEN } from './tts.interface';
import type { ITtsProvider, TtsResponse } from './tts.interface';

@Injectable()
export class TtsService {
  constructor(
    @Inject(TTS_PROVIDER_TOKEN) private readonly provider: ITtsProvider,
  ) {}

  /**
   * Synthesizes input text into speech.
   * @param text String message to synthesize into audio
   */
  async synthesize(text: string): Promise<TtsResponse> {
    return this.provider.synthesize(text);
  }
}
