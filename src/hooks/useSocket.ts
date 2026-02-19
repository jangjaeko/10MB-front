// 소켓 연결/이벤트 관리 훅 (연결 상태, 매칭 이벤트, 타이머 동기화)
'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { connectSocket, disconnectSocket, TypedSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMatchStore } from '@/stores/useMatchStore';

export const useSocket = () => {
  const socketRef = useRef<TypedSocket | null>(null);
  const { accessToken } = useAuthStore();
  const {
    setMatchFound,
    setRemainingSeconds,
    setWaitingCount,
    setEnded,
    reset,
  } = useMatchStore();

  // 연결 상태 관리
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 소켓 연결 및 이벤트 리스너 등록
  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket(accessToken);
    socketRef.current = socket;

    // 연결 성공
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socket.emit('user:online');
    });

    // 연결 해제
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // 연결 에러
    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setError(err.message);
    });

    // 매칭 검색 중 (대기열 추가됨)
    socket.on('match:searching', (data) => {
      setWaitingCount(data.waitingCount);
    });

    // 매칭 성공
    socket.on('match:found', (data) => {
      setMatchFound(data);
    });

    // 매칭 취소 확인
    socket.on('match:cancelled', () => {
      reset();
    });

    // 타이머 동기화
    socket.on('match:timer_sync', (data) => {
      setRemainingSeconds(data.remainingSeconds);
    });

    // 2분 남음 경고 (추후 UI 알림 연동)
    socket.on('match:timer_warning', () => {
      // 2분 경고 처리
    });

    // 타이머 종료 (10분 완료)
    socket.on('match:timer_end', () => {
      setEnded('timer');
    });

    // 파트너 나감 (중간 이탈)
    socket.on('match:partner_left', () => {
      setEnded('partner_left');
    });

    // 서버 에러
    socket.on('match:error', (data) => {
      setError(data.message);
      reset();
    });

    return () => {
      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [accessToken, setMatchFound, setRemainingSeconds, setWaitingCount, setEnded, reset]);

  // 매칭 시작 emit
  const startMatch = useCallback((interests: string[]) => {
    socketRef.current?.emit('match:start', { interests });
  }, []);

  // 매칭 취소 emit
  const cancelMatch = useCallback(() => {
    socketRef.current?.emit('match:cancel');
  }, []);

  // 통화방 나가기 emit
  const leaveMatch = useCallback(() => {
    socketRef.current?.emit('match:leave');
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    startMatch,
    cancelMatch,
    leaveMatch,
  };
};
