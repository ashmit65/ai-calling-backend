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
import { RedisModule } from './redis/redis.module';
import { FaqModule } from './faq/faq.module';
import { LlmModule } from './llm/llm.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { AudioModule } from './audio/audio.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { SttModule } from './media/stt/stt.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    CallsModule,
    WorkflowsModule,
    TranscriptsModule,
    AgentsModule,
    PrismaModule,
    IntentModule,
    RedisModule,
    FaqModule,
    LlmModule,
    AnalyticsModule,
    AiModule,
    AudioModule,
    OrchestratorModule,
    SttModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
