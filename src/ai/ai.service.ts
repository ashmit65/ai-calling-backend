import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {

  private client = new OpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY,
  });

  async ask(prompt: string) {

    const response =
      await this.client.chat.completions.create({

        model: 'meta/llama-3.1-70b-instruct', // example

        messages: [
          {
            role:'user',
            content: prompt
          }
        ],

        temperature:0.5
      });

    return response.choices[0].message.content;
  }

}