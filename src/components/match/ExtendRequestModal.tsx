// 연장 요청 모달 (요청자: 대기 화면, 수신자: 수락/거절 선택)
'use client';

import { useT } from '@/hooks/useT';

type ExtendStatus = 'none' | 'requested' | 'received' | 'approved' | 'rejected';

interface ExtendRequestModalProps {
  extendStatus: ExtendStatus;
  partnerNickname: string;
  onRespond: (accept: boolean) => void;
}

export const ExtendRequestModal = ({
  extendStatus,
  partnerNickname,
  onRespond,
}: ExtendRequestModalProps) => {
  const { t } = useT();
  if (extendStatus !== 'requested' && extendStatus !== 'received') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-2xl p-6 mx-4 w-full max-w-xs border border-gray-800">
        {extendStatus === 'requested' ? (
          <>
            {/* 요청자: 대기 화면 */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400 animate-spin" style={{ animationDuration: '2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">
              {t('match.extendRequesting')}
            </h3>
            <p className="text-sm text-gray-400 text-center">
              {t('match.extendWaiting')}
            </p>
          </>
        ) : (
          <>
            {/* 수신자: 수락/거절 선택 */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">
              {t('match.extendReceived')}
            </h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              {t('match.extendMessage', { nickname: partnerNickname })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onRespond(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
              >
                {t('match.extendDecline')}
              </button>
              <button
                onClick={() => onRespond(true)}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                {t('match.extendAccept')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
