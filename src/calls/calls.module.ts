import { Module } from '@nestjs/common';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IntentModule } from '../intent/intent.module';
import { FaqModule } from '../faq/faq.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { LlmModule } from '../llm/llm.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    IntentModule,
    FaqModule,
    WorkflowsModule,
    LlmModule,
    AnalyticsModule,
  ],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}