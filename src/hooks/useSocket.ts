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
    setExtendStatus,
    setExtended,
    setTotalSeconds,
    reset,
  } = useMatchStore();

  // 연결 상태 관리
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

    // 재연결 중 상태
  const [isReconnecting, setIsReconnecting] = useState(false);

  // 소켓 연결 및 이벤트 리스너 등록
  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket(accessToken);
    socketRef.current = socket;

    // 연결 성공
    socket.on('connect', () => {
      setIsConnected(true);
      setIsReconnecting(false);
      setError(null);
      socket.emit('user:online');
    });

    // 연결 해제
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // 재연결 이벤트는 Manager 레벨에서 처리
    const manager = socket.io;
    const onReconnectAttempt = () => setIsReconnecting(true);
    const onReconnect = () => {
      setIsReconnecting(false);
      setIsConnected(true);
      setError(null);
      socket.emit('user:online');
    };
    const onReconnectFailed = () => {
      setIsReconnecting(false);
      setError('서버 연결이 끊겼습니다. 페이지를 새로고침해주세요.');
    };
    manager.on('reconnect_attempt', onReconnectAttempt);
    manager.on('reconnect', onReconnect);
    manager.on('reconnect_failed', onReconnectFailed);

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

    // 연장 요청 수신 (상대방이 요청)
    socket.on('match:extend_request', () => {
      setExtendStatus('received');
    });

    // 연장 승인 (양쪽 동의)
    socket.on('match:extend_approved', (data) => {
      setExtendStatus('approved');
      setExtended();
      setRemainingSeconds(data.newRemaining);
      const store = useMatchStore.getState();
      setTotalSeconds(store.totalSeconds + data.addedSeconds);
    });

    // 연장 거절
    socket.on('match:extend_rejected', () => {
      setExtendStatus('rejected');
      setExtended();
    });

    // 서버 에러 (활성 통화 중에는 리셋하지 않음)
    socket.on('match:error', (data) => {
      setError(data.message);
      const { phase } = useMatchStore.getState();
      if (phase !== 'active' && phase !== 'matched') {
        reset();
      }
    });

    return () => {
      manager.off('reconnect_attempt', onReconnectAttempt);
      manager.off('reconnect', onReconnect);
      manager.off('reconnect_failed', onReconnectFailed);
      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [accessToken, setMatchFound, setRemainingSeconds, setWaitingCount, setEnded, setExtendStatus, setExtended, setTotalSeconds, reset]);

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

  // 연장 요청 emit
  const requestExtend = useCallback(() => {
    socketRef.current?.emit('match:extend_request');
    setExtendStatus('requested');
  }, [setExtendStatus]);

  // 연장 응답 emit
  const respondExtend = useCallback((accept: boolean) => {
    socketRef.current?.emit('match:extend_response', { accept });
    if (!accept) {
      setExtendStatus('none');
    }
  }, [setExtendStatus]);

  // 온라인 상태 재등록 (탭 전환/백그라운드 복귀 시 사용)
  const pingOnline = useCallback(() => {
    socketRef.current?.emit('user:online');
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isReconnecting,
    error,
    startMatch,
    cancelMatch,
    leaveMatch,
    requestExtend,
    respondExtend,
    pingOnline,
  };
};
