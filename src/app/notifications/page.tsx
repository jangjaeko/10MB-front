// 알림 페이지 (목록 + 커서 페이지네이션 + 읽음 처리)
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { NotificationList } from '@/components/notifications/NotificationList';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { api } from '@/lib/api';
import type { Notification, NotificationListResponse } from '@/types';

export default function NotificationsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const { setUnreadCount, decrementBy } = useNotificationStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialFetchDone = useRef(false);

  const fetchNotifications = useCallback(async (cursor?: string) => {
    if (cursor) {
      setIsLoadingMore(true);
    } else {
      setIsFetching(true);
    }

    try {
      const data = (await api.getNotifications({ cursor, limit: 20 })) as NotificationListResponse;
      if (cursor) {
        setNotifications((prev) => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('[알림] 목록 조회 실패:', err);
    } finally {
      setIsFetching(false);
      setIsLoadingMore(false);
    }
  }, []);

  // 첫 로드
  useEffect(() => {
    if (!isAuthenticated || initialFetchDone.current) return;
    initialFetchDone.current = true;
    fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  // 단건 읽음 처리
  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      decrementBy(1);
    } catch (err) {
      console.error('[알림] 읽음 처리 실패:', err);
    }
  }, [decrementBy]);

  // 전체 읽음 처리
  const handleMarkAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[알림] 전체 읽음 처리 실패:', err);
    }
  }, [setUnreadCount]);

  const hasUnread = notifications.some((n) => !n.is_read);

  if (isLoading || !isAuthenticated) return null;

  return (
    <>
      <Header title="알림" />
      <div className="pt-14 pb-20">
        {isFetching ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            hasUnread={hasUnread}
          />
        )}

        {/* 더 보기 버튼 */}
        {hasMore && !isFetching && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => fetchNotifications(nextCursor ?? undefined)}
              disabled={isLoadingMore}
              className="px-5 py-2 text-sm font-medium text-orange-500 bg-orange-50 rounded-full hover:bg-orange-100 disabled:opacity-50"
            >
              {isLoadingMore ? '불러오는 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
