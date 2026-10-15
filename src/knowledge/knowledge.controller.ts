import { Body, Controller, InternalServerErrorException, Logger, Param, Post } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('clients/:clientId/knowledge')
export class KnowledgeController {
  private readonly logger = new Logger(KnowledgeController.name);
  constructor(private readonly knowledge: KnowledgeService) {}
  @Post()
  create(@Param('clientId') clientId: string, @Body() body: { title: string; content: string }) {
    return this.knowledge.ingest(clientId, body.title, body.content).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Knowledge upload failed: ${message}`, error instanceof Error ? error.stack : undefined);
      if (process.env.NODE_ENV !== 'production') throw new InternalServerErrorException(message);
      throw new InternalServerErrorException('Knowledge upload failed');
    });
  }
}
