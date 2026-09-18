import { Injectable } from '@nestjs/common';
import * as faqData from './faq.data.json';

interface FaqEntry {
  keywords: string[];
  answer: string;
}

const rawFaqs: any = faqData;
const parsedFaqs: FaqEntry[] = Array.isArray(rawFaqs)
  ? rawFaqs
  : Array.isArray(rawFaqs.default)
    ? rawFaqs.default
    : Object.values(rawFaqs).filter(
        (x): x is FaqEntry => typeof x === 'object' && x !== null && 'keywords' in x,
      );

@Injectable()
export class FaqService {
  private readonly faqs: FaqEntry[] = parsedFaqs;

  lookup(transcript: string): { answer: string; matched: boolean } {
    const lowered = transcript.toLowerCase();

    for (const entry of this.faqs) {
      const match = entry.keywords.some((kw) => lowered.includes(kw));
      if (match) {
        return { answer: entry.answer, matched: true };
      }
    }

    return {
      answer:
        "I'm sorry, I don't have an answer for that. Let me connect you to an agent.",
      matched: false,
    };
  }
}
