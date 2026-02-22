// 게시글 카드 (닉네임, 시간, 미리보기, 좋아요, 댓글)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Post, PostCategory } from '@/types';

// 카테고리 라벨 매핑
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

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [isLiking, setIsLiking] = useState(false);

  // 좋아요 토글
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);

    // 낙관적 업데이트
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const result = await api.toggleLike(post.id) as { liked: boolean; likeCount: number };
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      // 실패 시 롤백
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  // 카드 클릭 → 상세 페이지
  const handleClick = () => {
    router.push(`/community/${post.id}`);
  };

  return (
    <article
      onClick={handleClick}
      className="px-4 py-4 border-b border-gray-800 active:bg-gray-800/30 transition-colors cursor-pointer"
    >
      {/* 상단: 닉네임 + 카테고리 + 시간 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-300">
            {post.authorNickname?.charAt(0) ?? '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white truncate">
              {post.authorNickname}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 shrink-0">
              {CATEGORY_LABEL[post.category]}
            </span>
          </div>
          <span className="text-xs text-gray-500">{timeAgo(post.created_at)}</span>
        </div>
      </div>

      {/* 제목 */}
      <h3 className="text-sm font-bold text-white mb-1">{post.title}</h3>

      {/* 내용 미리보기 (3줄) */}
      <p className="text-sm text-gray-300 line-clamp-3 whitespace-pre-wrap break-words">
        {post.content}
      </p>

      {/* 하단: 좋아요 + 댓글 */}
      <div className="flex items-center gap-5 mt-3">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-sm transition-colors"
        >
          {isLiked ? (
            <svg className="w-4.5 h-4.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
          <span className={`text-xs ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
            {likeCount > 0 ? likeCount : ''}
          </span>
        </button>

        <div className="flex items-center gap-1 text-sm">
          <svg className="w-4.5 h-4.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          <span className="text-xs text-gray-500">
            {post.comment_count > 0 ? post.comment_count : ''}
          </span>
        </div>
      </div>
    </article>
  );
};
