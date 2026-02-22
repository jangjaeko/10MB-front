// 게시글 작성 페이지
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { POST_CATEGORIES } from '@/types';
import type { PostCategory } from '@/types';

export default function WritePostPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  const [category, setCategory] = useState<PostCategory>('free');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.createPost({ category, title: title.trim(), content: content.trim() });
      router.push('/community');
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 작성에 실패했습니다');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          취소
        </button>
        <h1 className="text-sm font-semibold text-white">글쓰기</h1>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`text-sm font-semibold transition-colors ${
            canSubmit
              ? 'text-orange-500 hover:text-orange-400'
              : 'text-gray-600'
          }`}
        >
          {isSubmitting ? '게시 중...' : '게시'}
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 카테고리 선택 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {POST_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 제목 */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          maxLength={100}
          className="w-full bg-transparent text-white text-lg font-bold placeholder:text-gray-600 outline-none"
        />

        {/* 내용 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="무슨 생각을 하고 있어요?"
          rows={12}
          className="w-full bg-transparent text-gray-200 text-sm placeholder:text-gray-600 outline-none resize-none"
        />

        {/* 에러 */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
