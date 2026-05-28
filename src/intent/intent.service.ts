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

    async detect(transcript: string): Promise<Intent> {
      const cacheKey = `intent:${Buffer.from(transcript).toString('base64')}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached as Intent;

      // simple rule‑based detection (placeholder)
      let intent: Intent = Intent.UNKNOWN;
      const lowered = transcript.toLowerCase();
      if (lowered.includes('price') || lowered.includes('faq')) {
        intent = Intent.FAQ;
      } else if (lowered.includes('book') || lowered.includes('schedule')) {
        intent = Intent.WORKFLOW;
      }

      await this.cache.set(cacheKey, intent);
      return intent;
    }
  }