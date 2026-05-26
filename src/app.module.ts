import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CallsModule } from './calls/calls.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { TranscriptsModule } from './transcripts/transcripts.module';
import { AgentsModule } from './agents/agents.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { IntentModule } from './intent/intent.module';

@Module({
  imports: [ConfigModule.forRoot(), CallsModule, WorkflowsModule, TranscriptsModule, AgentsModule, PrismaModule, IntentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
