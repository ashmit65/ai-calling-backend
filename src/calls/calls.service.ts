import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntentService, Intent } from '../intent/intent.service';
import { FaqService } from '../faq/faq.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { LlmService } from '../llm/llm.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    private prisma: PrismaService,
    private intentService: IntentService,
    private faqService: FaqService,
    private workflowsService: WorkflowsService,
    private llmService: LlmService,
    private analyticsService: AnalyticsService,
  ) {}

  findAll() {
    return this.prisma.call.findMany();
  }

  async create(body: any) {
    const startTime = Date.now();

    // 1. Detect intent (uses Redis cache internally)
    const detectedIntent = body.transcript
      ? await this.intentService.detect(body.transcript)
      : body.intent;

    // 2. Save the call record
    const call = await this.prisma.call.create({
      data: {
        phone: body.phone,
        intent: detectedIntent,
        transcript: body.transcript,
      },
    });

    // 3. Route to the correct branch based on intent
    let response: any;
    let branch: string;
    let tokenCount: number | undefined;

    switch (detectedIntent) {
      case Intent.FAQ:
        branch = 'FAQ';
        response = this.faqService.lookup(body.transcript);
        break;

      case Intent.WORKFLOW:
        branch = 'WORKFLOW';
        response = this.workflowsService.handle(body.transcript);
        break;

      case Intent.UNKNOWN:
      default:
        branch = 'LLM';
        const llmResult = await this.llmService.ask(body.transcript);
        response = { answer: llmResult.response };
        tokenCount = llmResult.tokenCount;
        break;
    }

    const latencyMs = Date.now() - startTime;

    // 4. Record analytics
    await this.analyticsService.record({
      callId: call.id,
      branch,
      tokenCount,
      latencyMs,
    });

    this.logger.log(
      `Call ${call.id} routed to ${branch} branch (${latencyMs}ms)`,
    );

    return {
      call,
      intent: detectedIntent,
      branch,
      response,
    };
  }
}