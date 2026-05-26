export enum Intent {
  FAQ = 'FAQ',
  WORKFLOW = 'WORKFLOW',
  UNKNOWN = 'UNKNOWN',
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class IntentService {
  detect(text: string): Intent {
    if (!text) return Intent.UNKNOWN;
    
    const lowerText = text.toLowerCase();
    
    const faqKeywords = ['faq', 'help', 'question', 'what', 'how', 'why'];
    const workflowKeywords = ['book', 'schedule', 'cancel', 'workflow', 'appointment', 'meeting'];

    if (faqKeywords.some(keyword => lowerText.includes(keyword))) {
      return Intent.FAQ;
    }

    if (workflowKeywords.some(keyword => lowerText.includes(keyword))) {
      return Intent.WORKFLOW;
    }

    return Intent.UNKNOWN;
  }
}
