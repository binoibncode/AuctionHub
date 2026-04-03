import type { Server } from 'socket.io';

let ioInstance: Server | null = null;

export function registerSocketHandlers(io: Server) {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('auction:join', (auctionId: string) => {
      socket.join(`auction:${auctionId}`);
    });

    socket.on('auction:leave', (auctionId: string) => {
      socket.leave(`auction:${auctionId}`);
    });
  });
}

export function emitToAuction(auctionId: string, event: string, payload: unknown) {
  if (!ioInstance) return;
  ioInstance.to(`auction:${auctionId}`).emit(event, payload);
}
