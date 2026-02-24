// 삭제 확인 모달 (게시글/댓글 공용)
'use client';

import { useT } from '@/hooks/useT';

interface ConfirmModalProps {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const { t } = useT();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* 모달 본체 */}
      <div className="relative bg-gray-900 rounded-2xl w-72 overflow-hidden border border-gray-800">
        <div className="px-6 py-5 text-center">
          <p className="text-sm text-gray-200">{message}</p>
        </div>
        <div className="flex border-t border-gray-800">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm text-gray-400 hover:bg-gray-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <div className="w-px bg-gray-800" />
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-sm text-red-400 font-semibold hover:bg-gray-800 transition-colors"
          >
            {confirmLabel ?? t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};
