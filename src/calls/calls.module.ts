import { Module } from '@nestjs/common';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IntentModule } from '../intent/intent.module';

@Module({
  imports: [PrismaModule, IntentModule],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}