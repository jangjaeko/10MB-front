// 알림 목록 컴포넌트 (카드 + 읽음/미읽음 상태 + 이동)
'use client';

import { useRouter } from 'next/navigation';
import type { Notification } from '@/types';

interface Props {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  hasUnread: boolean;
}

// 알림 타입별 아이콘
const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  if (type === 'comment') {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    );
  }
  // like
  return (
    <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
};

// 상대 시간 표시 (예: "3분 전", "2시간 전")
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

export const NotificationList = ({ notifications, onMarkRead, onMarkAllRead, hasUnread }: Props) => {
  const router = useRouter();

  const handleTap = (notif: Notification) => {
    if (!notif.is_read) {
      onMarkRead(notif.id);
    }
    // 게시글 상세로 이동 (댓글/좋아요 모두 같은 목적지)
    if (notif.data.postId) {
      router.push(`/community/${notif.data.postId}`);
    }
  };

  // 빈 상태
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">아직 알림이 없어요</p>
        <p className="text-sm text-gray-400 mt-1">커뮤니티에 글을 올려보세요!</p>
      </div>
    );
  }

  return (
    <div>
      {/* 전체 읽음 버튼 */}
      {hasUnread && (
        <div className="flex justify-end px-4 py-2 border-b border-gray-100">
          <button
            onClick={onMarkAllRead}
            className="text-sm text-orange-500 font-medium hover:text-orange-600 active:text-orange-700"
          >
            모두 읽음
          </button>
        </div>
      )}

      {/* 알림 카드 목록 */}
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id}>
            <button
              onClick={() => handleTap(notif)}
              className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors active:bg-gray-50 ${
                !notif.is_read ? 'bg-orange-50/60' : 'bg-white'
              }`}
            >
              {/* 미읽음 점 */}
              <div className="flex flex-col items-center pt-1.5 shrink-0 w-2">
                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </div>

              {/* 타입 아이콘 */}
              <NotificationIcon type={notif.type} />

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!notif.is_read ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                  {notif.body}
                </p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
              </div>
            </button>

            {/* 구분선 */}
            <div className="ml-4 border-b border-gray-100" />
          </li>
        ))}
      </ul>
    </div>
  );
};
