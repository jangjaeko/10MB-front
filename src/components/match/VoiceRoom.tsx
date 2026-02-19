// 음성 통화 화면 (타이머 + 상대방 정보 + 마이크 토글 + 나가기 + 신고)
'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer } from './Timer';

interface VoiceRoomProps {
  partner: {
    nickname: string;
    interests: string[];
  };
  commonInterests: string[];
  isConnected: boolean;
  connectionError: string | null;
  isMicOn: boolean;
  // 타이머 데이터
  formattedTime: string;
  progress: number;
  isWarning: boolean;
  isUrgent: boolean;
  remainingSeconds: number;
  // 핸들러
  onToggleMic: () => void;
  onLeave: () => void;
  onReport: () => void;
}

export const VoiceRoom = ({
  partner,
  commonInterests,
  isConnected,
  connectionError,
  isMicOn,
  formattedTime,
  progress,
  isWarning,
  isUrgent,
  remainingSeconds,
  onToggleMic,
  onLeave,
  onReport,
}: VoiceRoomProps) => {
  // 나가기 확인 모달
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  // 30초 토스트
  const [showToast, setShowToast] = useState(false);
  const toastShownRef = useRef(false);

  // 30초 남았을 때 토스트 표시 (1회만)
  useEffect(() => {
    if (remainingSeconds === 30 && !toastShownRef.current) {
      toastShownRef.current = true;
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [remainingSeconds]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-gray-950 px-4 py-6 relative">
      {/* 우측 상단 신고 버튼 */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onReport}
          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
          aria-label="신고"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </button>
      </div>

      {/* 음성 연결 상태 표시 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span
          className={`w-2 h-2 rounded-full ${
            connectionError
              ? 'bg-red-500'
              : isConnected
                ? 'bg-green-500'
                : 'bg-yellow-500 animate-pulse'
          }`}
        />
        <span className="text-sm text-gray-400">
          {connectionError
            ? connectionError
            : isConnected
              ? '음성 연결됨'
              : '음성 연결 중...'}
        </span>
      </div>

      {/* 타이머 */}
      <div className="flex justify-center mb-6">
        <Timer
          formattedTime={formattedTime}
          progress={progress}
          isWarning={isWarning}
          isUrgent={isUrgent}
        />
      </div>

      {/* 상대방 정보 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* 아바타 + 음성 파동 효과 */}
        <div className="relative mb-5">
          {isConnected && (
            <>
              <div className="absolute inset-0 -m-3 rounded-full bg-orange-500/10 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 -m-1.5 rounded-full bg-orange-500/5" />
            </>
          )}
          <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-2xl text-white font-bold">
              {partner.nickname[0]}
            </span>
          </div>
        </div>

        {/* 닉네임 */}
        <h2 className="text-xl font-bold text-white mb-3">
          {partner.nickname}
        </h2>

        {/* 관심사 태그 (공통 관심사 오렌지 하이라이트) */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xs">
          {partner.interests.map((interest) => {
            const isCommon = commonInterests.includes(interest);
            return (
              <span
                key={interest}
                className={`px-3 py-1 text-sm rounded-full font-medium ${
                  isCommon
                    ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {interest}
              </span>
            );
          })}
        </div>
      </div>

      {/* 하단 컨트롤 버튼 */}
      <div className="flex items-center justify-center gap-10 py-8">
        {/* 마이크 토글 (큰 원형) */}
        <button
          onClick={onToggleMic}
          className={`rounded-full flex items-center justify-center transition-all duration-200 ${
            isMicOn
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50'
          }`}
          style={{ width: 72, height: 72 }}
          aria-label={isMicOn ? '마이크 끄기' : '마이크 켜기'}
        >
          {isMicOn ? (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        {/* 나가기 버튼 */}
        <button
          onClick={() => setShowLeaveModal(true)}
          className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
          aria-label="나가기"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* 나가기 확인 모달 */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl p-6 mx-4 w-full max-w-xs border border-gray-800">
            <h3 className="text-lg font-bold text-white text-center mb-2">
              대화를 종료할까요?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              음성 연결이 끊기고 홈으로 돌아갑니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  onLeave();
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 30초 남음 토스트 */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30">
            곧 대화가 종료됩니다
          </div>
        </div>
      )}
    </div>
  );
};
