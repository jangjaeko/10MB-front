// 신고 모달 (사유 라디오 선택 + 추가 설명 + 제출)
'use client';

import { useState } from 'react';
import type { ReportReason } from '@/types';

interface ReportModalProps {
  onSubmit: (reason: ReportReason, description?: string) => Promise<void>;
  onClose: () => void;
}

// 신고 사유 목록
const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'harassment', label: '욕설 / 폭언' },
  { value: 'inappropriate', label: '성희롱' },
  { value: 'spam', label: '스팸 / 광고' },
  { value: 'other', label: '기타' },
];

export const ReportModal = ({ onSubmit, onClose }: ReportModalProps) => {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 신고 제출
  const handleSubmit = async () => {
    if (!reason || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(reason, description || undefined);
      setIsSubmitted(true);
      setTimeout(onClose, 1500);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-2xl p-6 mx-4 w-full max-w-sm border border-gray-800">
        {/* 제출 완료 상태 */}
        {isSubmitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">신고가 접수되었습니다</p>
            <p className="text-sm text-gray-400 mt-1">검토 후 조치하겠습니다</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white mb-1">신고하기</h3>
            <p className="text-sm text-gray-400 mb-5">신고 사유를 선택해주세요.</p>

            {/* 사유 라디오 선택 */}
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    reason === item.value
                      ? 'bg-red-500/15 ring-1 ring-red-500/40'
                      : 'bg-gray-800 hover:bg-gray-750'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => setReason(item.value)}
                    className="sr-only"
                  />
                  {/* 커스텀 라디오 */}
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      reason === item.value
                        ? 'border-red-500'
                        : 'border-gray-600'
                    }`}
                  >
                    {reason === item.value && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    )}
                  </span>
                  <span className={`text-sm ${
                    reason === item.value ? 'text-white' : 'text-gray-300'
                  }`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            {/* 추가 설명 */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 내용을 입력해주세요 (선택)"
              rows={3}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50 mb-5"
            />

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '제출 중...' : '신고하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
