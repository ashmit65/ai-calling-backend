import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SttService } from './stt.service';
import { SttResponse } from './stt.interface';

@Controller('stt')
export class SttController {
  constructor(private readonly sttService: SttService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @UploadedFile() file: any,
  ): Promise<SttResponse> {
    if (!file) {
      throw new BadRequestException('Required file field "file" is missing.');
    }

    return this.sttService.transcribe(file.buffer, file.mimetype);
  }
}
