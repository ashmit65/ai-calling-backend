import { AudioGateway } from './audio.gateway';

describe('AudioGateway', () => {
  it('sends generated text before TTS so it survives a speech failure', async () => {
    const sttService = {
      transcribe: jest.fn().mockResolvedValue({ transcript: 'What time is it?' }),
    };
    const orchestrator = {
      process: jest.fn().mockResolvedValue({ text: 'We are open until six.' }),
    };
    const ttsService = {
      synthesize: jest.fn().mockRejectedValue(new Error('TTS unavailable')),
    };
    const gateway = new AudioGateway(sttService, orchestrator, ttsService);
    const client = { id: 'test-client', emit: jest.fn() };

    await gateway.handleAudio(client, Buffer.from('audio'));

    expect(client.emit.mock.calls.map(([event]) => event)).toEqual([
      'user-text',
      'ai-text',
      'audio-error',
    ]);
    expect(client.emit).toHaveBeenLastCalledWith('audio-error', {
      stage: 'speech',
      message:
        'Your text reply is ready, but speech audio could not be generated. Check the backend logs.',
    });
  });

  it('reports an empty transcript and skips conversation processing', async () => {
    const sttService = {
      transcribe: jest.fn().mockResolvedValue({ transcript: '  ' }),
    };
    const orchestrator = { process: jest.fn() };
    const ttsService = { synthesize: jest.fn() };
    const gateway = new AudioGateway(sttService, orchestrator, ttsService);
    const client = { id: 'test-client', emit: jest.fn() };

    await gateway.handleAudio(client, Buffer.from('audio'));

    expect(client.emit).toHaveBeenCalledWith('audio-error', {
      stage: 'transcription',
      message: 'No speech was detected. Try again and speak clearly.',
    });
    expect(orchestrator.process).not.toHaveBeenCalled();
    expect(ttsService.synthesize).not.toHaveBeenCalled();
  });
});
