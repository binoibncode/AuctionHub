import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }

  return socket;
}

export function joinAuctionRoom(auctionId: string) {
  const s = getSocket();
  s.emit('auction:join', auctionId);
}

export function leaveAuctionRoom(auctionId: string) {
  const s = getSocket();
  s.emit('auction:leave', auctionId);
}

export function onBidPlaced(handler: (payload: unknown) => void) {
  const s = getSocket();
  s.on('bid:placed', handler);
  return () => s.off('bid:placed', handler);
}
