// 댓글 개별 아이템 (닉네임, 내용, 시간, 본인 삭제)
'use client';

import { useState } from 'react';
import type { Comment } from '@/types';
import { ConfirmModal } from './ConfirmModal';

// 상대 시간 표시
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

interface CommentItemProps {
  comment: Comment;
  isMine: boolean;
  onDelete: (commentId: string) => void;
}

export const CommentItem = ({ comment, isMine, onDelete }: CommentItemProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-start gap-2">
          {/* 아바타 */}
          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-bold text-gray-300">
              {comment.authorNickname?.charAt(0) ?? '?'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* 닉네임 + 시간 + 삭제 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">{comment.authorNickname}</span>
                <span className="text-[10px] text-gray-500">{timeAgo(comment.created_at)}</span>
              </div>
              {isMine && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="text-gray-600 hover:text-red-400 transition-colors p-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>

            {/* 댓글 내용 */}
            <p className="text-sm text-gray-300 mt-0.5 break-words">{comment.content}</p>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showConfirm && (
        <ConfirmModal
          message="댓글을 삭제하시겠어요?"
          onConfirm={() => {
            onDelete(comment.id);
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};
