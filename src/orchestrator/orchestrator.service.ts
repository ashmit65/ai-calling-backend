import { Injectable, Inject, Logger } from '@nestjs/common';
import { CONVERSATION_HANDLERS } from './orchestrator.constants';
import { ConversationHandler, HandlerIdentifier, ConversationResponse } from './interfaces/conversation-handler.interface';
import { ConversationContext } from './interfaces/conversation-context.interface';
import { DecisionEngine } from './decision-engine.service';
import { IntentService } from '../intent/intent.service';
import { CallsService } from '../calls/calls.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ConversationOrchestrator {
  private readonly logger = new Logger(ConversationOrchestrator.name);
  private readonly handlerRegistry = new Map<HandlerIdentifier, ConversationHandler>();

  constructor(
    @Inject(CONVERSATION_HANDLERS) handlers: ConversationHandler[],
    private readonly decisionEngine: DecisionEngine,
    private readonly intentService: IntentService,
    private readonly callsService: CallsService,
    private readonly analyticsService: AnalyticsService,
  ) {
    for (const handler of handlers) {
      this.logger.log(`Registering conversation handler: ${handler.getIdentifier()}`);
      this.handlerRegistry.set(handler.getIdentifier(), handler);
    }
  }

  async process(input: { phone: string; transcript: string }): Promise<ConversationResponse> {
    const startTime = Date.now();
    this.logger.log(`Received process request for phone: ${input.phone}`);

    // 1. Initial Call Session Registration
    const callRecord = await this.callsService.createCall(input.phone, undefined, input.transcript);

    // 2. Classify intent with continuous confidence scores
    const { intent, confidence } = await this.intentService.detect(input.transcript);
    this.logger.log(`Classified intent as ${intent} with confidence ${confidence.toFixed(2)}`);

    // 3. Assemble Conversation Context
    const context: ConversationContext = {
      callId: callRecord.id,
      phone: input.phone,
      transcript: input.transcript,
      currentIntent: intent,
      confidence,
    };

    // 4. Decision Engine routing
    const decision = this.decisionEngine.decide(context);
    this.logger.log(`DecisionEngine routed execution to handler: ${decision.handler} (reason: ${decision.reason})`);

    // 5. Retrieve registered handler
    const handler = this.handlerRegistry.get(decision.handler);
    if (!handler) {
      this.logger.error(`Registered handler not found for identifier: ${decision.handler}`);
      throw new Error(`Execution error: No handler registered for ${decision.handler}`);
    }

    // 6. Execute business branch logic
    const handlerResponse = await handler.handle(context);

    // 7. Update database record with determined intent
    await this.callsService.updateCall(callRecord.id, { intent });

    // 8. Commit analytics data
    const latencyMs = Date.now() - startTime;
    const tokenCount = handlerResponse.metadata?.tokenCount as number | undefined;

    await this.analyticsService.record({
      callId: callRecord.id,
      branch: decision.handler.toUpperCase(),
      tokenCount,
      latencyMs,
    });

    this.logger.log(`Finished processing conversation turn in ${latencyMs}ms`);

    // 9. Standardized output packaging
    return {
      text: handlerResponse.text,
      handler: decision.handler,
      confidence: decision.confidence,
      actions: handlerResponse.actions,
      metadata: {
        callRecord,
        intent,
        branchResponse: handlerResponse.metadata?.rawResponse || handlerResponse,
      },
    };
  }
}
