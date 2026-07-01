import { Intent } from '../../intent/intent.service';

export interface ConversationContext {
  callId?: string;
  phone: string;
  transcript: string;
  currentIntent?: Intent;
  confidence?: number;
  retryCount?: number;
  currentWorkflow?: string;
  metadata?: Record<string, any>;
}
