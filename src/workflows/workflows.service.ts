import { Injectable } from '@nestjs/common';

export interface WorkflowResult {
  action: string;
  status: string;
  message: string;
}

@Injectable()
export class WorkflowsService {
  handle(transcript: string): WorkflowResult {
    const lowered = transcript.toLowerCase();

    if (lowered.includes('cancel')) {
      return {
        action: 'cancel',
        status: 'pending',
        message:
          'Your cancellation request has been received. A confirmation will be sent to your registered contact shortly.',
      };
    }

    if (lowered.includes('reschedule') || lowered.includes('change')) {
      return {
        action: 'reschedule',
        status: 'pending',
        message:
          'Your rescheduling request has been noted. Please provide your preferred date and time.',
      };
    }

    if (
      lowered.includes('book') ||
      lowered.includes('schedule') ||
      lowered.includes('appointment') ||
      lowered.includes('meeting')
    ) {
      return {
        action: 'book',
        status: 'confirmed',
        message:
          'Your booking has been confirmed. You will receive a confirmation with the details shortly.',
      };
    }

    return {
      action: 'unknown',
      status: 'pending',
      message:
        'I understood you need help with a workflow. Could you please clarify what you would like to do?',
    };
  }
}
