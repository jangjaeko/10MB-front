// 댓글 목록 + 하단 고정 입력창
'use client';

import { useState } from 'react';
import type { Comment } from '@/types';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  comments: Comment[];
  currentUserId: string | undefined;
  isSubmitting: boolean;
  onSubmit: (content: string) => Promise<void>;
  onDelete: (commentId: string) => void;
}

export const CommentSection = ({
  comments,
  currentUserId,
  isSubmitting,
  onSubmit,
  onDelete,
}: CommentSectionProps) => {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    await onSubmit(text.trim());
    setText('');
  };

  return (
    <>
      {/* 댓글 목록 (오래된 순) */}
      <div>
        {comments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-sm">아직 댓글이 없어요</p>
            <p className="text-gray-700 text-xs mt-1">첫 번째 댓글을 남겨보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isMine={comment.user_id === currentUserId}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* 하단 고정 댓글 입력창 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3 z-50">
        <div className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="댓글을 입력해주세요"
            className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2.5 outline-none placeholder:text-gray-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
              text.trim()
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-800 text-gray-600'
            }`}
          >
            등록
          </button>
        </div>
      </div>
    </>
  );
};
