import { KnowledgeService } from './knowledge.service';

describe('KnowledgeService', () => {
  it('rejects empty documents', async () => {
    const service = new KnowledgeService({} as any);
    await expect(service.ingest('client-a', 'FAQ', '  ')).rejects.toThrow('cannot be empty');
  });

  it('retrieves only matching client chunks', async () => {
    const prisma = { knowledgeChunk: { findMany: jest.fn().mockResolvedValue([
      { content: 'We open at nine', terms: 'we open at nine', documentId: 'doc-a' },
      { content: 'Unrelated text', terms: 'unrelated text', documentId: 'doc-b' },
    ]) } };
    const service = new KnowledgeService(prisma as any);
    const result = await service.search('client-a', 'What time do you open?');
    expect(prisma.knowledgeChunk.findMany).toHaveBeenCalledWith({ where: { clientId: 'client-a' }, take: 100 });
    expect(result).toHaveLength(1);
    expect(result[0].documentId).toBe('doc-a');
  });
});
