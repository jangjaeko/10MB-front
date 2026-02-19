// 통화 종료 평가 화면 (종료 사유 표시 + 평가 + 다시 매칭/홈 이동)
'use client';

import { useState } from 'react';
import type { Rating } from '@/types';

interface RatingModalProps {
  endReason: 'timer' | 'partner_left' | 'self_left' | null;
  onRate: (rating: Rating) => void;
  onRematch: () => void;
  onGoHome: () => void;
  onReport: () => void;
}

export const RatingModal = ({
  endReason,
  onRate,
  onRematch,
  onGoHome,
  onReport,
}: RatingModalProps) => {
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 종료 사유별 메시지
  const endMessage =
    endReason === 'partner_left'
      ? '상대방이 나갔습니다'
      : endReason === 'self_left'
        ? '대화를 종료했습니다'
        : '10분이 지났어요!';

  // 평가 선택 핸들러
  const handleRate = async (rating: Rating) => {
    setSelectedRating(rating);
    setIsSubmitting(true);
    try {
      await onRate(rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95">
      <div className="w-full max-w-sm mx-4 text-center">
        {/* 종료 사유 아이콘 */}
        <div className="mb-6">
          {endReason === 'partner_left' ? (
            <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <h2 className="text-2xl font-bold text-white mb-1">{endMessage}</h2>
          <p className="text-gray-400">즐거운 대화였나요?</p>
        </div>

        {/* 평가 버튼 */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => handleRate('good')}
            disabled={isSubmitting}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-200 ${
              selectedRating === 'good'
                ? 'bg-orange-500/20 ring-2 ring-orange-500'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <span className="text-4xl">&#128077;</span>
            <span className={`text-sm font-medium ${
              selectedRating === 'good' ? 'text-orange-400' : 'text-gray-300'
            }`}>
              좋았어요
            </span>
          </button>

          <button
            onClick={() => handleRate('neutral')}
            disabled={isSubmitting}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-200 ${
              selectedRating === 'neutral'
                ? 'bg-gray-600/30 ring-2 ring-gray-500'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <span className="text-4xl">&#128528;</span>
            <span className={`text-sm font-medium ${
              selectedRating === 'neutral' ? 'text-gray-300' : 'text-gray-300'
            }`}>
              보통이에요
            </span>
          </button>
        </div>

        {/* CTA 버튼 */}
        <div className="space-y-3">
          <button
            onClick={onRematch}
            className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-lg transition-colors"
          >
            다시 매칭하기
          </button>
          <button
            onClick={onGoHome}
            className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
          >
            홈으로
          </button>
        </div>

        {/* 신고 버튼 */}
        <button
          onClick={onReport}
          className="mt-6 text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          상대방 신고하기
        </button>
      </div>
    </div>
  );
};
