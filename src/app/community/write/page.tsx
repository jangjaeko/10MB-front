// 게시글 작성/수정 페이지 (?edit=postId로 수정 모드)
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { POST_CATEGORIES } from '@/types';
import type { Post, PostCategory } from '@/types';

const MAX_TITLE = 100;
const MAX_CONTENT = 500;

function WritePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPostId = searchParams.get('edit');
  const isEditMode = !!editPostId;

  const { isLoading, isAuthenticated } = useAuth();

  const [category, setCategory] = useState<PostCategory>('free');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 수정 모드: 기존 게시글 불러오기
  useEffect(() => {
    if (!isAuthenticated || !editPostId) return;

    const loadPost = async () => {
      setIsLoadingPost(true);
      try {
        const data = await api.getPost(editPostId) as Post;
        setCategory(data.category);
        setTitle(data.title);
        setContent(data.content);
      } catch {
        router.push('/community');
      } finally {
        setIsLoadingPost(false);
      }
    };

    loadPost();
  }, [isAuthenticated, editPostId, router]);

  const titleLen = title.length;
  const contentLen = content.length;
  const canSubmit =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    contentLen <= MAX_CONTENT &&
    !isSubmitting;

  // 작성 / 수정 제출
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        await api.updatePost(editPostId, {
          title: title.trim(),
          content: content.trim(),
        });
      } else {
        await api.createPost({
          category,
          title: title.trim(),
          content: content.trim(),
        });
      }
      router.push('/community');
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 저장에 실패했습니다');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-gray-950 flex justify-center pt-20">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <h1 className="text-sm font-semibold text-white">
          {isEditMode ? '글 수정' : '새 글 작성'}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`text-sm font-semibold transition-colors ${
            canSubmit
              ? 'text-orange-500 hover:text-orange-400'
              : 'text-gray-600'
          }`}
        >
          {isSubmitting
            ? (isEditMode ? '수정 중...' : '게시 중...')
            : (isEditMode ? '수정' : '등록')}
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 카테고리 선택 (수정 모드에서는 변경 불가) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {POST_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => !isEditMode && setCategory(cat.value)}
              disabled={isEditMode}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat.value
                  ? 'bg-orange-500 text-white'
                  : isEditMode
                    ? 'bg-gray-800/50 text-gray-600'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 제목 */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
            placeholder="제목"
            className="w-full bg-transparent text-white text-lg font-bold placeholder:text-gray-600 outline-none"
          />
          <div className="flex justify-end mt-1">
            <span className={`text-[10px] ${titleLen > MAX_TITLE * 0.9 ? 'text-orange-400' : 'text-gray-600'}`}>
              {titleLen}/{MAX_TITLE}
            </span>
          </div>
        </div>

        {/* 내용 */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
            placeholder="무슨 생각을 하고 있어요?"
            rows={12}
            className="w-full bg-transparent text-gray-200 text-sm placeholder:text-gray-600 outline-none resize-none"
          />
          <div className="flex justify-end">
            <span className={`text-xs ${
              contentLen > MAX_CONTENT * 0.9
                ? contentLen >= MAX_CONTENT
                  ? 'text-red-400'
                  : 'text-orange-400'
                : 'text-gray-600'
            }`}>
              {contentLen}/{MAX_CONTENT}
            </span>
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}

// useSearchParams()는 Suspense boundary 필요
export default function WritePostPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex justify-center pt-20">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WritePostContent />
    </Suspense>
  );
}
