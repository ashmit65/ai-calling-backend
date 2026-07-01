import { Injectable } from '@nestjs/common';
import { ConversationHandler, HandlerIdentifier, ConversationResponse } from '../interfaces/conversation-handler.interface';
import { ConversationContext } from '../interfaces/conversation-context.interface';
import { FaqService } from '../../faq/faq.service';

@Injectable()
export class FaqHandler implements ConversationHandler {
  constructor(private readonly faqService: FaqService) {}

  getIdentifier(): HandlerIdentifier {
    return 'faq';
  }

  async handle(context: ConversationContext): Promise<ConversationResponse> {
    const result = this.faqService.lookup(context.transcript);
    return {
      text: result.answer,
      handler: this.getIdentifier(),
      confidence: context.confidence ?? 1.0,
      metadata: {
        rawResponse: result,
      },
    };
  }
}
