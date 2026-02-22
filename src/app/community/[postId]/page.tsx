// 게시글 상세 페이지 (내용 + 댓글 + 좋아요 + ⋯ 메뉴)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { CommentSection } from '@/components/community/CommentSection';
import { ConfirmModal } from '@/components/community/ConfirmModal';
import type { Post, Comment, PostCategory } from '@/types';

const CATEGORY_LABEL: Record<PostCategory, string> = {
  free: '자유',
  concern: '고민',
  humor: '유머',
  topic: '대화주제추천',
  review: '대화후기',
};

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

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;

  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { user } = useAuthStore();

  const [post, setPost] = useState<(Post & { comments: Comment[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // ⋯ 메뉴 상태
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 삭제 확인 모달 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 게시글 조회
  useEffect(() => {
    if (!isAuthenticated || !postId) return;

    const fetchPost = async () => {
      try {
        const data = await api.getPost(postId) as Post & { comments: Comment[] };
        setPost(data);
        setIsLiked(data.isLiked ?? false);
        setLikeCount(data.like_count);
      } catch {
        router.push('/community');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [isAuthenticated, postId, router]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // 좋아요 토글
  const handleLike = async () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const result = await api.toggleLike(postId) as { liked: boolean; likeCount: number };
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  // 댓글 작성
  const handleAddComment = async (content: string) => {
    setIsSubmitting(true);
    try {
      const newComment = await api.createComment(postId, content) as Comment;
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comment_count: prev.comment_count + 1,
              comments: [...prev.comments, { ...newComment, authorNickname: user?.nickname ?? '나' }],
            }
          : prev,
      );
    } catch (err) {
      console.error('[10MB] 댓글 작성 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(postId, commentId);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comment_count: Math.max(0, prev.comment_count - 1),
              comments: prev.comments.filter((c) => c.id !== commentId),
            }
          : prev,
      );
    } catch (err) {
      console.error('[10MB] 댓글 삭제 실패:', err);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    setShowDeleteConfirm(false);
    try {
      await api.deletePost(postId);
      router.push('/community');
    } catch (err) {
      console.error('[10MB] 게시글 삭제 실패:', err);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex justify-center pt-20">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  const isAuthor = user?.id === post.user_id;

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <h1 className="text-sm font-semibold text-white">게시글</h1>

        {/* 본인 글: ⋯ 메뉴 */}
        {isAuthor ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg z-50 min-w-[100px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push(`/community/write?edit=${postId}`);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 text-left transition-colors"
                >
                  수정
                </button>
                <div className="h-px bg-gray-700" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 text-left transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-7" />
        )}
      </div>

      {/* 게시글 내용 */}
      <div className="px-4 py-4 border-b border-gray-800">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-300">
              {post.authorNickname?.charAt(0) ?? '?'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">{post.authorNickname}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400">
                {CATEGORY_LABEL[post.category]}
              </span>
            </div>
            <span className="text-xs text-gray-500">{timeAgo(post.created_at)}</span>
          </div>
        </div>

        {/* 제목 + 내용 */}
        <h2 className="text-base font-bold text-white mb-2">{post.title}</h2>
        <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{post.content}</p>

        {/* 좋아요 + 댓글 수 */}
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-800">
          <button onClick={handleLike} className="flex items-center gap-1.5">
            {isLiked ? (
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            )}
            <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
              {likeCount}
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <span className="text-sm text-gray-500">{post.comments?.length ?? 0}</span>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <CommentSection
        comments={post.comments ?? []}
        currentUserId={user?.id}
        isSubmitting={isSubmitting}
        onSubmit={handleAddComment}
        onDelete={handleDeleteComment}
      />

      {/* 게시글 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <ConfirmModal
          message="게시글을 삭제하시겠어요?"
          onConfirm={handleDeletePost}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
