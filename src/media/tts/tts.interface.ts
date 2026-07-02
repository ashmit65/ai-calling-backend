export interface TtsResponse {
  audio: Buffer;
  metadata: {
    provider: string;
    model?: string;
    voice?: string;
    format: string;
    duration?: number;
    [key: string]: any;
  };
}

export interface ITtsProvider {
  /**
   * Synthesizes text input into a raw audio buffer.
   * @param text The sentence or paragraph to synthesize
   */
  synthesize(text: string): Promise<TtsResponse>;
}

export const TTS_PROVIDER_TOKEN = Symbol('TTS_PROVIDER_TOKEN');
