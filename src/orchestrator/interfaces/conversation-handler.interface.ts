import { ConversationContext } from './conversation-context.interface';

export type HandlerIdentifier = 'faq' | 'workflow' | 'llm' | 'human-transfer' | 'voicemail';

export interface ConversationResponse {
  text: string;
  handler: HandlerIdentifier;
  confidence: number;
  actions?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface ConversationHandler {
  getIdentifier(): HandlerIdentifier;
  handle(context: ConversationContext): Promise<ConversationResponse>;
}
