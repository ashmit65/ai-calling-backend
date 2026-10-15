import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

export interface LlmResult {
  response: string;
  tokenCount: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }

  async ask(transcript: string): Promise<LlmResult> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'meta/llama-3.2-11b-vision-instruct',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful AI phone receptionist. Keep responses concise and professional. Respond as if you are speaking on a phone call.',
          },
          {
            role: 'user',
            content: transcript,
          },
        ],
      });

      const response =
        completion.choices?.[0]?.message?.content ??
        'I apologize, I could not generate a response.';

      const tokenCount =
        (completion.usage?.prompt_tokens ?? 0) +
        (completion.usage?.completion_tokens ?? 0);

      return { response, tokenCount };
    } catch (error) {
      this.logger.error('LLM call failed', error);
      return {
        response:
          'I apologize, but I am unable to process your request right now. Let me connect you to a human agent.',
        tokenCount: 0,
      };
    }
  }

  async askGrounded(question: string, context: string): Promise<LlmResult> {
    return this.askWithSystem(
      question,
      `You are a customer support agent. Answer only using the knowledge-base context below. Never use general knowledge or guess. If the context does not answer the question, say: I don't have that information available. I'll connect you with customer care.\n\nKnowledge-base context:\n${context}`,
    );
  }

  private async askWithSystem(transcript: string, system: string): Promise<LlmResult> {
    const completion = await this.client.chat.completions.create({ model: 'meta/llama-3.2-11b-vision-instruct', max_tokens: 300, messages: [{ role: 'system', content: system }, { role: 'user', content: transcript }] });
    return { response: completion.choices?.[0]?.message?.content ?? 'I apologize, I could not generate a response.', tokenCount: (completion.usage?.prompt_tokens ?? 0) + (completion.usage?.completion_tokens ?? 0) };
  }
}
