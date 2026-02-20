// 방 입장 후 전체 화면 음성 뷰 (참여자 목록, 마이크, 나가기, 토스트)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ParticipantList } from './ParticipantList';
import type { Room } from '@/types';

interface RoomParticipant {
  userId: string;
  nickname: string;
  interests: string[];
}

interface ActiveRoomViewProps {
  room: Room;
  isConnected: boolean;
  connectionError: string | null;
  isMicOn: boolean;
  participants: RoomParticipant[];
  speakingUserIds: Set<string>;
  myUserId?: string;
  onToggleMic: () => void;
  onLeave: () => void;
}

// 토스트 메시지 타입
interface Toast {
  id: number;
  message: string;
  type: 'join' | 'leave';
}

let toastId = 0;

export const ActiveRoomView = ({
  room,
  isConnected,
  connectionError,
  isMicOn,
  participants,
  speakingUserIds,
  myUserId,
  onToggleMic,
  onLeave,
}: ActiveRoomViewProps) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 토스트 추가
  const addToast = useCallback((message: string, type: 'join' | 'leave') => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // 부모에서 호출할 수 있도록 window 이벤트 활용
  useEffect(() => {
    const handleRoomToast = (e: CustomEvent<{ message: string; type: 'join' | 'leave' }>) => {
      addToast(e.detail.message, e.detail.type);
    };
    window.addEventListener('room:toast', handleRoomToast as EventListener);
    return () => {
      window.removeEventListener('room:toast', handleRoomToast as EventListener);
    };
  }, [addToast]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{room.icon}</span>
          <div>
            <h2 className="text-white font-bold text-lg">{room.name}</h2>
            <p className="text-gray-400 text-xs">
              {participants.length}명 참여 중
            </p>
          </div>
        </div>
        {/* 연결 상태 */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
            }`}
          />
          <span className="text-xs text-gray-400">
            {isConnected ? '연결됨' : '연결 중...'}
          </span>
        </div>
      </div>

      {/* 중앙 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {connectionError ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-sm">{connectionError}</p>
          </div>
        ) : (
          <>
            {/* 방 아이콘 + 상태 */}
            <div className="flex flex-col items-center pt-4 mb-6">
              <div className="relative w-20 h-20 mb-3">
                {isConnected && (
                  <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-ping" style={{ animationDuration: '2s' }} />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">{room.icon}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {isConnected ? '대화에 참여 중이에요' : '음성 채널에 연결하는 중...'}
              </p>
            </div>

            {/* 참여자 목록 */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 px-1">
                참여자 ({participants.length})
              </h3>
              <ParticipantList
                participants={participants}
                speakingUserIds={speakingUserIds}
                myUserId={myUserId}
                isMicOn={isMicOn}
              />
            </div>
          </>
        )}
      </div>

      {/* 하단 컨트롤 */}
      <div className="px-6 pb-10 flex items-center justify-center gap-8">
        {/* 마이크 토글 */}
        <button
          onClick={onToggleMic}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isMicOn
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-red-500/20 ring-2 ring-red-500'
          }`}
        >
          {isMicOn ? (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        {/* 나가기 버튼 */}
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* 토스트 메시지 */}
      <div className="fixed top-16 left-0 right-0 z-[70] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-full text-sm font-medium animate-fade-in-out ${
              toast.type === 'join'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-gray-700/80 text-gray-300 border border-gray-600/30'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* 나가기 확인 모달 */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl p-6 mx-6 w-full max-w-xs text-center border border-gray-800">
            <h3 className="text-white font-bold text-lg mb-2">대화방 나가기</h3>
            <p className="text-gray-400 text-sm mb-6">정말 나가시겠어요?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={onLeave}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
