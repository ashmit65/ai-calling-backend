import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface KnowledgeMatch { content: string; score: number; documentId: string }

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async ingest(clientId: string, title: string, rawText: string) {
    if (!rawText?.trim()) throw new Error('Knowledge content cannot be empty');
    // Keep each FAQ question and its answer in the same retrieval chunk.
    // Documents should separate entries with a blank line.
    const chunks = rawText.split(/\r?\n\s*\r?\n/).map((x) => x.trim()).filter(Boolean);
    const db = this.prisma as any;
    return db.knowledgeDocument.create({
      data: { client: { connect: { id: clientId } }, title, rawText, chunks: { create: chunks.map((content) => ({ clientId, content, terms: this.normalize(content) })) } },
      include: { chunks: true },
    });
  }

  async search(clientId: string, query: string): Promise<KnowledgeMatch[]> {
    const queryTerms = new Set(this.normalize(query).split(' ').filter((x) => x.length > 2));
    if (!queryTerms.size) return [];
    const chunks = await (this.prisma as any).knowledgeChunk.findMany({ where: { clientId }, take: 100 });
    return chunks.map((chunk) => {
      const terms = new Set(chunk.terms.split(' '));
      const score = [...queryTerms].filter((term) => terms.has(term)).length / queryTerms.size;
      return { content: chunk.content, score, documentId: chunk.documentId };
    }).filter((match) => match.score >= 0.25).sort((a, b) => b.score - a.score).slice(0, 4);
  }

  private normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
}
