import { Server } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import Container from 'typedi';
import QueryProcessor from '../QueryProcessor';

export default class SocketManager {
  private io: SocketServer;

  constructor(server: Server) {
    this.io = new SocketServer(server, { cors: { origin: '*' } });
    this.onInit();
  }

  private onInit() {
    this.io.on('connection', async (socket) => {
      socket.emit('Connected');
      socket.on('query', async (data) => {
        const queryProcessor = Container.get(QueryProcessor);
        const query = data.query as string;
        await queryProcessor.processQuery(query, socket);
      });
    });
  }
}
