// 타이머 훅 (서버 timer_sync 동기화 + 로컬 매초 보간)
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMatchStore } from '@/stores/useMatchStore';

// 타이머 기준값
const TOTAL_SECONDS = 600;     // 10분
const WARNING_SECONDS = 120;   // 2분 경고
const URGENT_SECONDS = 30;     // 30초 긴급

export const useTimer = () => {
  const { remainingSeconds, phase } = useMatchStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 로컬 보간 타이머 (서버 이벤트 사이 매초 UI 업데이트)
  useEffect(() => {
    if (phase !== 'active') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 이미 돌고 있으면 중복 방지
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      const store = useMatchStore.getState();
      if (store.remainingSeconds > 0) {
        store.setRemainingSeconds(store.remainingSeconds - 1);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase]);

  // 프로그레스 비율 (0~100)
  const progress = (remainingSeconds / TOTAL_SECONDS) * 100;

  // 경고 상태 (2분 이하 ~ 30초 초과)
  const isWarning = remainingSeconds <= WARNING_SECONDS && remainingSeconds > URGENT_SECONDS;

  // 긴급 상태 (30초 이하)
  const isUrgent = remainingSeconds <= URGENT_SECONDS;

  // MM:SS 포맷
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.max(0, seconds) % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    remainingSeconds,
    progress,
    isWarning,
    isUrgent,
    formattedTime: formatTime(remainingSeconds),
  };
};
