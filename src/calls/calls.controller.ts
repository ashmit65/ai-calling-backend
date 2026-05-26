import { Body, Controller, Get, Post } from '@nestjs/common';
import { CallsService } from './calls.service';

@Controller('calls')
export class CallsController {

  constructor(
    private readonly callsService: CallsService
  ) { }

  @Get()
  findAll() {
    return this.callsService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.callsService.create(body);
  }

}