import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../redis/cache.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async check() {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let redisStatus = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    try {
      const isRedisUp = await this.cacheService.ping();
      redisStatus = isRedisUp ? 'healthy' : 'unhealthy';
    } catch {
      redisStatus = 'unhealthy';
    }

    const isSystemHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';
    const payload = {
      status: isSystemHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: Date.now() - startTime,
      memoryUsage: {
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };

    if (!isSystemHealthy) {
      throw new ServiceUnavailableException(payload);
    }

    return payload;
  }
}
