import { Module, Global } from '@nestjs/common';
import { CONVERSATION_HANDLERS } from './orchestrator.constants';
import { DecisionEngine } from './decision-engine.service';
import { ConversationOrchestrator } from './orchestrator.service';
import { FaqHandler } from './handlers/faq.handler';
import { WorkflowHandler } from './handlers/workflow.handler';
import { LlmHandler } from './handlers/llm.handler';
import { IntentModule } from '../intent/intent.module';
import { FaqModule } from '../faq/faq.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { LlmModule } from '../llm/llm.module';
import { CallsModule } from '../calls/calls.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { RagHandler } from './handlers/rag.handler';

@Global()
@Module({
  imports: [
    IntentModule,
    FaqModule,
    WorkflowsModule,
    LlmModule,
    CallsModule,
    AnalyticsModule,
    KnowledgeModule,
  ],
  providers: [
    DecisionEngine,
    ConversationOrchestrator,
    FaqHandler,
    WorkflowHandler,
    LlmHandler,
    RagHandler,
    {
      provide: CONVERSATION_HANDLERS,
      useFactory: (
        faq: FaqHandler,
        workflow: WorkflowHandler,
        llm: LlmHandler,
        rag: RagHandler,
      ) => {
        return [faq, workflow, llm, rag];
      },
      inject: [FaqHandler, WorkflowHandler, LlmHandler, RagHandler],
    },
  ],
  exports: [ConversationOrchestrator],
})
export class OrchestratorModule {}
