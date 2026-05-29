import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AudioGateway {
  @WebSocketServer() server: Server;

  // collect raw chunks per connection
  private clientBuffers: Map<string, Buffer[]> = new Map();

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
    this.clientBuffers.set(client.id, []);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
    this.clientBuffers.delete(client.id);
  }

  @SubscribeMessage('audio')
  handleAudio(client: any, payload: any) {
    const buffers = this.clientBuffers.get(client.id) ?? [];
    buffers.push(Buffer.from(payload));
    this.clientBuffers.set(client.id, buffers);

    // send everything back as a quick echo (so you can hear your own voice)
    client.emit('audio-echo', payload);
  }
}
