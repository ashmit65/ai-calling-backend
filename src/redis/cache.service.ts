import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async get(key: string): Promise<string | null> {
    try {
      if (this.client.status !== 'ready') {
        return null;
      }
      return await this.client.get(key);
    } catch (err) {
      this.logger.warn(`Redis get failed: ${err.message}. Falling back to cache miss.`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSec = 300): Promise<string | null> {
    try {
      if (this.client.status !== 'ready') {
        return null;
      }
      return await this.client.set(key, value, 'EX', ttlSec);
    } catch (err) {
      this.logger.warn(`Redis set failed: ${err.message}. Skipping caching.`);
      return null;
    }
  }
}