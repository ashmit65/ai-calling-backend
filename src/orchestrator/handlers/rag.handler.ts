import { Injectable } from '@nestjs/common';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { LlmService } from '../../llm/llm.service';
import { ConversationContext } from '../interfaces/conversation-context.interface';
import { ConversationHandler, ConversationResponse } from '../interfaces/conversation-handler.interface';

@Injectable()
export class RagHandler implements ConversationHandler {
  constructor(private readonly knowledge: KnowledgeService, private readonly llm: LlmService) {}
  getIdentifier() { return 'rag' as const; }
  async handle(context: ConversationContext): Promise<ConversationResponse> {
    const matches = await this.knowledge.search(context.clientId, context.transcript);
    if (!matches.length) return { text: "I don't have that information available. I'll connect you with customer care.", handler: 'rag', confidence: 0, actions: ['customer-care'], metadata: { escalate: true } };
    const result = await this.llm.askGrounded(context.transcript, matches.map((m) => m.content).join('\n'));
    return { text: result.response, handler: 'rag', confidence: matches[0].score, metadata: { tokenCount: result.tokenCount, sources: matches.map((m) => m.documentId) } };
  }
}
