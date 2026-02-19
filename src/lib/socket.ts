// Socket.IO 클라이언트 초기화 (타입 안전, 재연결 설정)
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// 서버→클라이언트 이벤트 타입
export interface ServerToClientEvents {
  'match:searching': (data: { waitingCount: number }) => void;
  'match:found': (data: {
    sessionId: string;
    partnerId: string;
    partner: { nickname: string; interests: string[] };
    commonInterests: string[];
    agoraChannelId: string;
    agoraToken: string;
  }) => void;
  'match:cancelled': (data: Record<string, never>) => void;
  'match:timer_sync': (data: { remainingSeconds: number }) => void;
  'match:timer_warning': () => void;
  'match:timer_end': () => void;
  'match:partner_left': () => void;
  'match:error': (data: { message: string }) => void;
}

// 클라이언트→서버 이벤트 타입
export interface ClientToServerEvents {
  'match:start': (data: { interests: string[] }) => void;
  'match:cancel': () => void;
  'match:leave': () => void;
  'user:online': () => void;
}

// 타입이 지정된 소켓 타입
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

// 소켓 인스턴스 반환 (싱글톤)
export const getSocket = (): TypedSocket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    }) as TypedSocket;
  }
  return socket;
};

// JWT 토큰으로 소켓 연결
export const connectSocket = (token: string): TypedSocket => {
  const s = getSocket();
  s.auth = { token };
  if (!s.connected) {
    s.connect();
  }
  return s;
};

// 소켓 연결 해제
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
