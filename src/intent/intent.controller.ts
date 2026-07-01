import { Controller, Post, Body } from '@nestjs/common';
import { IntentService } from './intent.service';

@Controller('intent')
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  @Post()
  async detectIntent(@Body('transcript') transcript: string) {
    const result = await this.intentService.detect(transcript);
    return result;
  }
}
