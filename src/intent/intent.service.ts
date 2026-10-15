import { Injectable } from '@nestjs/common';
import { CacheService } from '../redis/cache.service';

export enum Intent {
  FAQ = 'FAQ',
  WORKFLOW = 'WORKFLOW',
  UNKNOWN = 'UNKNOWN',
}

@Injectable()
export class IntentService {
  constructor(private readonly cache: CacheService) {}

  async detect(
    transcript: string,
  ): Promise<{ intent: Intent; confidence: number }> {
    const cacheKey = `intent:${Buffer.from(transcript).toString('base64')}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && 'intent' in parsed) {
          return {
            intent: parsed.intent as Intent,
            confidence: parsed.confidence ?? 0.5,
          };
        }
      } catch {
        // Fallback if cached value is not valid JSON (old cache format)
        return { intent: cached as Intent, confidence: 1.0 };
      }
    }

    // simple rule‑based detection with continuous confidence score
    let intent: Intent = Intent.UNKNOWN;
    let confidence = 0.1;
    const lowered = transcript
      .toLowerCase()
      .replace(/^\s*(oh|okay|ok|well|um|uh| hey)[,\s]+/i, '')
      .trim();

    if (
      lowered.includes('price') ||
      lowered.includes('faq') ||
      lowered.includes('cost') ||
      lowered.includes('pricing') ||
      lowered.includes('time') ||
      lowered.includes('hours') ||
      lowered.includes('open')
    ) {
      intent = Intent.FAQ;
      // higher confidence if it starts with the keyword, otherwise medium confidence
      confidence =
        lowered.startsWith('price') || lowered.startsWith('faq') ? 0.95 : 0.85;
    } else if (
      /^(how|what|can|where|when)\b/.test(lowered) &&
      /(book|schedule|cancel|appointment)/.test(lowered)
    ) {
      // Questions about an action should be grounded in the client's knowledge base.
      // Direct commands such as "cancel my appointment" remain workflows below.
      intent = Intent.UNKNOWN;
      confidence = 0.1;
    } else if (
      lowered.includes('book') ||
      lowered.includes('schedule') ||
      lowered.includes('cancel') ||
      lowered.includes('appointment')
    ) {
      intent = Intent.WORKFLOW;
      confidence =
        lowered.startsWith('book') ||
        lowered.startsWith('schedule') ||
        lowered.startsWith('cancel')
          ? 0.95
          : 0.75;
    }

    const result = { intent, confidence };
    await this.cache.set(cacheKey, JSON.stringify(result));
    return result;
  }
}
