import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RecordAnalyticsInput {
  callId: string;
  branch: string;
  tokenCount?: number;
  latencyMs: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(data: RecordAnalyticsInput) {
    return this.prisma.callAnalytics.create({
      data: {
        callId: data.callId,
        branch: data.branch,
        tokenCount: data.tokenCount ?? null,
        latencyMs: data.latencyMs,
      },
    });
  }

  async getSummary() {
    const analytics = await this.prisma.callAnalytics.findMany();

    const branchCounts: Record<string, number> = {};
    const branchLatencies: Record<string, number[]> = {};
    let totalTokens = 0;

    for (const entry of analytics) {
      // Count per branch
      branchCounts[entry.branch] = (branchCounts[entry.branch] ?? 0) + 1;

      // Collect latencies per branch
      if (!branchLatencies[entry.branch]) {
        branchLatencies[entry.branch] = [];
      }
      branchLatencies[entry.branch].push(entry.latencyMs);

      // Sum tokens
      if (entry.tokenCount) {
        totalTokens += entry.tokenCount;
      }
    }

    // Calculate average latency per branch
    const avgLatency: Record<string, number> = {};
    for (const [branch, latencies] of Object.entries(branchLatencies)) {
      avgLatency[branch] = Math.round(
        latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
      );
    }

    return {
      totalCalls: analytics.length,
      branchCounts,
      avgLatencyMs: avgLatency,
      totalTokensUsed: totalTokens,
    };
  }
}
