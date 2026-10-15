import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('clients')
export class ClientController {
  constructor(private readonly prisma: PrismaService) {}
  @Post()
  create(@Body() body: { name: string; supportPhone?: string; supportEmail?: string }) {
    return this.prisma.client.create({ data: body });
  }
}
