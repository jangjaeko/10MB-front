// 매칭 대기 화면 (펄스 애니메이션, 대기 시간 카운트업, 취소 버튼)
'use client';

import { useEffect, useState } from 'react';

interface MatchingLoaderProps {
  waitingCount: number;
  searchStartTime: number | null;
  isTimedOut?: boolean;
  onCancel: () => void;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const MatchingLoader = ({
  waitingCount,
  searchStartTime,
  isTimedOut = false,
  onCancel,
  onRetry,
  onGoHome,
}: MatchingLoaderProps) => {
  const [elapsed, setElapsed] = useState(0);

  // 대기 시간 카운트업 (1초 간격)
  useEffect(() => {
    if (!searchStartTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - searchStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [searchStartTime]);

  // 초 → mm:ss 포맷
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 타임아웃 화면 (60초 초과)
  if (isTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          지금은 대화 가능한 분이 적어요
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          잠시 후 다시 시도해주세요
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={onGoHome}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          >
            홈으로
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* 펄스 애니메이션 */}
      <div className="relative w-36 h-36 mb-10">
        <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" />
        <div
          className="absolute inset-3 rounded-full bg-orange-500/30 animate-ping"
          style={{ animationDelay: '0.3s' }}
        />
        <div
          className="absolute inset-6 rounded-full bg-orange-500/40 animate-ping"
          style={{ animationDelay: '0.6s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 텍스트 */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        대화 상대를 찾고 있어요
      </h2>
      <p className="text-gray-500 text-sm mb-1">
        현재 <span className="font-semibold text-orange-500">{waitingCount}</span>명이 대기 중
      </p>

      {/* 대기 시간 */}
      <p className="text-2xl font-mono font-bold text-gray-700 mt-4 mb-8">
        {formatTime(elapsed)}
      </p>

      {/* 취소 버튼 */}
      <button
        onClick={onCancel}
        className="px-8 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
      >
        취소
      </button>
    </div>
  );
};
