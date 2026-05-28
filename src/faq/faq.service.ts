import { Injectable } from '@nestjs/common';
import * as faqData from './faq.data.json';

interface FaqEntry {
  keywords: string[];
  answer: string;
}

@Injectable()
export class FaqService {
  private readonly faqs: FaqEntry[] = faqData as FaqEntry[];

  lookup(transcript: string): { answer: string; matched: boolean } {
    const lowered = transcript.toLowerCase();

    for (const entry of this.faqs) {
      const match = entry.keywords.some((kw) => lowered.includes(kw));
      if (match) {
        return { answer: entry.answer, matched: true };
      }
    }

    return {
      answer: "I'm sorry, I don't have an answer for that. Let me connect you to an agent.",
      matched: false,
    };
  }
}
