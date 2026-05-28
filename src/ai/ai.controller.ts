import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {

  constructor(
    private aiService: AiService
  ) {}

  @Get()
  async ask(
    @Query('q') q:string
  ){
    return this.aiService.ask(q);
  }

}