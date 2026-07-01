import { Injectable } from '@nestjs/common';
import { ConversationContext } from './interfaces/conversation-context.interface';
import { HandlerIdentifier } from './interfaces/conversation-handler.interface';
import { Intent } from '../intent/intent.service';

export interface DecisionEngineResult {
  handler: HandlerIdentifier;
  confidence: number;
  reason: string;
}

@Injectable()
export class DecisionEngine {
  decide(context: ConversationContext): DecisionEngineResult {
    const intent = context.currentIntent;
    const confidence = context.confidence ?? 0.0;

    if (intent === Intent.FAQ && confidence > 0.5) {
      return {
        handler: 'faq',
        confidence,
        reason: `Matched FAQ intent with confidence ${confidence.toFixed(2)}`,
      };
    }

    if (intent === Intent.WORKFLOW && confidence > 0.5) {
      return {
        handler: 'workflow',
        confidence,
        reason: `Matched WORKFLOW intent with confidence ${confidence.toFixed(2)}`,
      };
    }

    // Default to LLM fallback
    return {
      handler: 'llm',
      confidence: Math.max(0.1, 1.0 - confidence),
      reason: `Defaulting to LLM due to intent ${intent} and confidence ${confidence.toFixed(2)}`,
    };
  }
}
