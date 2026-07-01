import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createCall(phone: string, intent?: string, transcript?: string) {
    this.logger.log(`Logging new call initialization for phone: ${phone}`);
    return this.prisma.call.create({
      data: {
        phone,
        intent: intent ?? null,
        transcript: transcript ?? null,
      },
    });
  }

  async updateCall(id: string, data: { intent?: string; transcript?: string }) {
    this.logger.log(`Updating call ${id} attributes`);
    return this.prisma.call.update({
      where: { id },
      data,
    });
  }

  async saveTranscript(id: string, transcript: string) {
    this.logger.log(`Saving transcript for call ${id}`);
    return this.prisma.call.update({
      where: { id },
      data: { transcript },
    });
  }

  async findCall(id: string) {
    this.logger.log(`Retrieving call record: ${id}`);
    return this.prisma.call.findUnique({
      where: { id },
    });
  }

  async findAllCalls() {
    this.logger.log('Retrieving all call records');
    return this.prisma.call.findMany();
  }
}