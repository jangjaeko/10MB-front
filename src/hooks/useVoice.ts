// Agora 음성 통화 관리 훅 (match: 1:1 매칭, room: 그룹 대화방)
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMatchStore } from '@/stores/useMatchStore';
import { api } from '@/lib/api';

// 최대 재시도 횟수
const MAX_RETRIES = 3;

type VoiceMode = 'match' | 'room';

export const useVoice = (mode: VoiceMode = 'match') => {
  const { agoraChannelId, setMuted, setPhase } = useMatchStore();

  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  // 현재 말하고 있는 uid 목록 (볼륨 기준)
  const [speakingUids, setSpeakingUids] = useState<Set<number>>(new Set());
  // 내 Agora uid
  const [myUid, setMyUid] = useState<number | null>(null);

  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  // 채널 입장 (토큰 발급 → join → 마이크 활성화)
  const join = useCallback(async (channelId: string) => {
    if (typeof window === 'undefined') return;

    try {
      setConnectionError(null);

      // 1. 백엔드에서 Agora 토큰 발급
      const { token, uid } = await api.getVoiceToken(channelId) as {
        token: string;
        channelId: string;
        uid: number;
      };

      // 2. Agora SDK 동적 로드 + 채널 입장
      const agora = await import('@/lib/agora');
      await agora.joinChannel(channelId, token, uid);

      // 3. 마이크 오디오 트랙 생성 + 발행
      await agora.publishMicrophone();

      // 4. 상대방 오디오 구독 리스너 등록
      agora.onUserPublished(async (user, mediaType) => {
        if (mediaType === 'audio') {
          await agora.subscribeRemoteAudio(user);
        }
      });

      // 5. 볼륨 인디케이터 활성화 (room 모드)
      if (mode === 'room') {
        agora.enableVolumeIndicator();
        agora.onVolumeIndicator((volumes) => {
          if (!mountedRef.current) return;
          const speaking = new Set<number>();
          for (const v of volumes) {
            if (v.level > 5) speaking.add(v.uid);
          }
          setSpeakingUids(speaking);
        });
      }

      if (mountedRef.current) {
        setIsConnected(true);
        setIsMicOn(true);
        setMyUid(uid);
        retryCountRef.current = 0;
        // match 모드에서만 phase 전환
        if (mode === 'match') {
          setPhase('active');
        }
      }
    } catch (err) {
      console.error('[10MB] 음성 연결 실패:', err);
      retryCountRef.current++;

      // 재시도 (최대 3회, 1초 → 2초 → 3초 간격)
      if (retryCountRef.current < MAX_RETRIES && mountedRef.current) {
        const delay = retryCountRef.current * 1000;
        console.log(`[10MB] ${delay}ms 후 재시도... (${retryCountRef.current}/${MAX_RETRIES})`);
        setTimeout(() => {
          if (mountedRef.current) join(channelId);
        }, delay);
        return;
      }

      // 재시도 초과
      if (mountedRef.current) {
        setConnectionError(getErrorMessage(err));
      }
    }
  }, [mode, setPhase]);

  // 채널 퇴장 + 리소스 정리
  const leave = useCallback(async () => {
    try {
      const agora = await import('@/lib/agora');
      await agora.leaveChannel();
    } catch (err) {
      console.error('[10MB] 채널 퇴장 에러:', err);
    }
    setIsConnected(false);
    setIsMicOn(true);
  }, []);

  // 마이크 ON/OFF 토글
  const toggleMic = useCallback(async () => {
    try {
      const agora = await import('@/lib/agora');
      const newState = !isMicOn;
      agora.setMicEnabled(newState);
      setIsMicOn(newState);
      if (mode === 'match') {
        setMuted(!newState);
      }
    } catch (err) {
      console.error('[10MB] 마이크 토글 에러:', err);
    }
  }, [isMicOn, mode, setMuted]);

  // match 모드: agoraChannelId가 설정되면 자동 입장
  useEffect(() => {
    if (mode !== 'match') return;

    mountedRef.current = true;

    if (agoraChannelId) {
      join(agoraChannelId);
    }

    return () => {
      mountedRef.current = false;
      import('@/lib/agora').then((agora) => {
        agora.leaveChannel().catch(() => {});
      });
      setIsConnected(false);
    };
  }, [mode, agoraChannelId, join]);

  // room 모드: 언마운트 시 정리만
  useEffect(() => {
    if (mode !== 'room') return;

    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      import('@/lib/agora').then((agora) => {
        agora.leaveChannel().catch(() => {});
      });
      setIsConnected(false);
    };
  }, [mode]);

  return {
    isConnected,
    isMicOn,
    connectionError,
    speakingUids,
    myUid,
    join,
    leave,
    toggleMic,
  };
};

// 에러 메시지를 유저 친화적으로 변환
function getErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes('PERMISSION_DENIED') || msg.includes('NotAllowedError')) {
    return '마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
  }
  if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
    return '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
  }
  if (msg.includes('INVALID_PARAMS') || msg.includes('App ID')) {
    return '음성 서비스 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
  }
  if (msg.includes('token') || msg.includes('Token')) {
    return '음성 연결 인증에 실패했습니다. 다시 시도해주세요.';
  }

  return '음성 연결에 실패했습니다. 네트워크를 확인하고 다시 시도해주세요.';
}
