import { Injectable } from '@nestjs/common';
import { ConversationHandler, HandlerIdentifier, ConversationResponse } from '../interfaces/conversation-handler.interface';
import { ConversationContext } from '../interfaces/conversation-context.interface';
import { LlmService } from '../../llm/llm.service';

@Injectable()
export class LlmHandler implements ConversationHandler {
  constructor(private readonly llmService: LlmService) {}

  getIdentifier(): HandlerIdentifier {
    return 'llm';
  }

  async handle(context: ConversationContext): Promise<ConversationResponse> {
    const result = await this.llmService.ask(context.transcript);
    return {
      text: result.response,
      handler: this.getIdentifier(),
      confidence: 1.0,
      metadata: {
        rawResponse: result,
        tokenCount: result.tokenCount,
      },
    };
  }
}
