import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { ClientController } from './client.controller';

@Module({ imports: [PrismaModule], controllers: [KnowledgeController, ClientController], providers: [KnowledgeService], exports: [KnowledgeService] })
export class KnowledgeModule {}
