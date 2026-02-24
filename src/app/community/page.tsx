// 커뮤니티 피드 (무한 스크롤, 카테고리 필터, 글쓰기 FAB)
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PostCard } from '@/components/community/PostCard';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Post, PostCategory, PostListResponse } from '@/types';
import { useT } from '@/hooks/useT';

export default function CommunityPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const { t } = useT();

  const CATEGORIES: { value: PostCategory | 'all'; label: string }[] = [
    { value: 'all', label: t('community.allCategory') },
    { value: 'free', label: t('community.catFree') },
    { value: 'concern', label: t('community.catConcern') },
    { value: 'humor', label: t('community.catHumor') },
    { value: 'topic', label: t('community.catTopic') },
    { value: 'review', label: t('community.catReview') },
  ];

  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<PostCategory | 'all'>('all');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  // 게시글 조회 (isFetching을 ref로 관리하여 useCallback 재생성 방지)
  const fetchPosts = useCallback(async (cursor?: string | null, reset = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetching(true);

    try {
      const params: any = { limit: 20 };
      if (category !== 'all') params.category = category;
      if (cursor) params.cursor = cursor;

      const data = await api.getPosts(params) as PostListResponse;

      setPosts((prev) => reset ? data.posts : [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('[10MB] 게시글 조회 실패:', err);
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
      setIsInitialLoad(false);
    }
  }, [category]);

  // 초기 로드 + 카테고리 변경 시
  useEffect(() => {
    if (!isAuthenticated) return;
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    setIsInitialLoad(true);
    fetchPosts(null, true);
  }, [isAuthenticated, category, fetchPosts]);

  // 무한 스크롤 (IntersectionObserver)
  useEffect(() => {
    if (!hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
          fetchPosts(nextCursor);
        }
      },
      { threshold: 0.1 },
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isFetching, nextCursor, fetchPosts]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="pb-20 min-h-screen bg-gray-950">
      {/* 상단 글쓰기 입력 영역 */}
      <div
        onClick={() => router.push('/community/write')}
        className="px-4 py-3 border-b border-gray-800 cursor-pointer active:bg-gray-800/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </div>
          <span className="text-sm text-gray-500">{t('community.writePrompt')}</span>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-gray-800">
        {CATEGORIES.map((cat) => (
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

      {/* 게시글 피드 */}
      {isInitialLoad ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-4xl mb-3 block">📝</span>
          <p className="text-gray-500 text-sm">{t('community.noPostsTitle')}</p>
          <p className="text-gray-600 text-xs mt-1">{t('community.noPostsBody')}</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* 무한 스크롤 트리거 */}
          <div ref={observerRef} className="h-10" />

          {isFetching && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-gray-600 text-xs py-6">
              {t('community.allLoaded')}
            </p>
          )}
        </>
      )}

      {/* 글쓰기 FAB */}
      <button
        onClick={() => router.push('/community/write')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center transition-all active:scale-95 z-40"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
      </button>
    </div>
  );
}
