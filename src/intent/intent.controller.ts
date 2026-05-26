import { Controller, Post, Body } from '@nestjs/common';
import { IntentService } from './intent.service';

@Controller('intent')
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  @Post()
  detectIntent(@Body('transcript') transcript: string) {
    const intent = this.intentService.detect(transcript);
    return { intent };
  }
}
