import { Socket } from 'socket.io';

export default class ChatController {
  private socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;
  }

  private emit(event: 'message' | 'loading', data: unknown) {
    this.socket.emit(event, JSON.stringify({ data }));
  }

  sendMsg(message: string) {
    this.emit('message', { answer: message });
  }

  setLoading(loading: boolean) {
    this.emit('loading', { loading });
  }

  sendMsgAndValues(answer: string, metadata: unknown) {
    this.emit('message', { answer, metadata });
  }
}
