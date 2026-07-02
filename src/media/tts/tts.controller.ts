import { Controller, Post, Body, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { TtsService } from './tts.service';

@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post()
  async synthesizeText(
    @Body('text') text: string,
    @Res() res: Response,
  ): Promise<void> {
    if (text === undefined || text === null || text.trim() === '') {
      throw new BadRequestException('Required body parameter "text" is missing or empty.');
    }

    const ttsResult = await this.ttsService.synthesize(text);

    // Determine appropriate Content-Type header based on format
    let contentType = 'audio/mpeg';
    const format = ttsResult.metadata.format.toLowerCase();
    if (format.includes('ulaw') || format.includes('mu-law')) {
      contentType = 'audio/x-mulaw';
    } else if (format.includes('pcm') || format.includes('l16')) {
      contentType = 'audio/l16';
    } else if (format.includes('wav')) {
      contentType = 'audio/wav';
    }

    res.set({
      'Content-Type': contentType,
      'Content-Length': ttsResult.audio.length,
      'Content-Disposition': 'inline', // plays in browser natively when supported
    });

    res.send(ttsResult.audio);
  }
}
