import { Body, Controller, Get, Post } from '@nestjs/common';
import { CallsService } from './calls.service';
import { ConversationOrchestrator } from '../orchestrator/orchestrator.service';

@Controller('calls')
export class CallsController {
  constructor(
    private readonly callsService: CallsService,
    private readonly orchestrator: ConversationOrchestrator,
  ) {}

  @Get()
  findAll() {
    return this.callsService.findAllCalls();
  }

  @Post()
  async create(@Body() body: any) {
    const result = await this.orchestrator.process(body);
    return {
      call: result.metadata?.callRecord,
      intent: result.metadata?.intent,
      branch: result.handler.toUpperCase(),
      response: result.metadata?.branchResponse,
    };
  }
}