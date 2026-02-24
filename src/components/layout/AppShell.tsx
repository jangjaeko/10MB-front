// 앱 공통 레이아웃 셸 (헤더 + 하단 네비를 경로에 따라 표시/숨김 + 전역 알림 소켓)
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { connectSocket } from '@/lib/socket';
import { api } from '@/lib/api';

// 네비게이션을 숨길 경로 패턴
const HIDE_NAV_PATHS = ['/auth', '/onboarding', '/community/write'];

// 자체 헤더를 사용하는 경로 (공통 헤더 숨김)
const CUSTOM_HEADER_PATHS = ['/match', '/profile/edit', '/community'];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { accessToken, isAuthenticated } = useAuthStore();
  const { setUnreadCount, increment } = useNotificationStore();

  // 로그인 시 unreadCount 초기화 + notification:new 소켓 리스너 등록
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // 초기 미읽음 수 조회
    api.getUnreadCount()
      .then(({ count }) => setUnreadCount(count))
      .catch(() => {});

    // 소켓 연결 (싱글톤 — match 페이지와 같은 인스턴스 공유)
    const socket = connectSocket(accessToken);

    const onNotificationNew = () => {
      increment();
    };

    socket.on('notification:new', onNotificationNew);

    return () => {
      socket.off('notification:new', onNotificationNew);
    };
  }, [isAuthenticated, accessToken, setUnreadCount, increment]);

  // auth, onboarding, 글쓰기에서는 네비 전체 숨김
  // /community/[postId] (상세 페이지)도 숨김
  const isCommunityDetail = pathname.startsWith('/community/') && pathname !== '/community/write';
  const shouldHideNav = isCommunityDetail || HIDE_NAV_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // match, profile/edit 등은 자체 헤더를 사용
  const hasCustomHeader = CUSTOM_HEADER_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  const showDefaultHeader = !shouldHideNav && !hasCustomHeader;

  return (
    <>
      {showDefaultHeader && <Header />}
      <div className={showDefaultHeader ? 'pt-14' : ''}>
        {children}
      </div>
      {!shouldHideNav && <BottomNav />}
    </>
  );
};
