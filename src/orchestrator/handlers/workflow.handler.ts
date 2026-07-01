import { Injectable } from '@nestjs/common';
import { ConversationHandler, HandlerIdentifier, ConversationResponse } from '../interfaces/conversation-handler.interface';
import { ConversationContext } from '../interfaces/conversation-context.interface';
import { WorkflowsService } from '../../workflows/workflows.service';

@Injectable()
export class WorkflowHandler implements ConversationHandler {
  constructor(private readonly workflowsService: WorkflowsService) {}

  getIdentifier(): HandlerIdentifier {
    return 'workflow';
  }

  async handle(context: ConversationContext): Promise<ConversationResponse> {
    const result = this.workflowsService.handle(context.transcript);
    return {
      text: result.message,
      handler: this.getIdentifier(),
      confidence: context.confidence ?? 1.0,
      actions: [result.action],
      metadata: {
        rawResponse: result,
      },
    };
  }
}
