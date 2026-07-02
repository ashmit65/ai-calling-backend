import 'dotenv/config';
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST ?? '127.0.0.1',
          port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) {
              return null; // stop reconnecting
            }
            return Math.min(times * 100, 2000);
          },
        });
      },
    },
    CacheService,
  ],
  exports: [REDIS_CLIENT, CacheService],
})
export class RedisModule {}