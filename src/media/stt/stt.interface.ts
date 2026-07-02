export interface SttMetadata {
  provider: string;
  confidence?: number;
  language?: string;
  duration?: number;
  [key: string]: any;
}

export interface SttResponse {
  transcript: string;
  metadata: SttMetadata;
}

export interface IsttProvider {
  /**
   * Transcribes raw audio buffer to text.
   * @param audioBuffer Raw binary audio buffer
   * @param mimeType Mime-type format of the audio (e.g. 'audio/wav', 'audio/x-mulaw')
   */
  transcribe(audioBuffer: Buffer, mimeType?: string): Promise<SttResponse>;
}

export const STT_PROVIDER_TOKEN = Symbol('STT_PROVIDER_TOKEN');
