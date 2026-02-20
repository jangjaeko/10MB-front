// 하단 네비게이션 바 (홈, 커뮤니티, 10분 시작, 알림, 마이페이지 5탭)
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BottomNav = () => {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isCommunity = pathname === '/community';
  const isMatch = pathname === '/match';
  const isNotifications = pathname === '/notifications';
  const isProfile = pathname === '/profile' || pathname.startsWith('/profile/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {/* 홈 탭 */}
        <Link href="/" className="flex flex-col items-center justify-center flex-1 py-2">
          <svg
            className={`w-6 h-6 ${isHome ? 'text-orange-500' : 'text-gray-400'}`}
            fill={isHome ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isHome ? 0 : 1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className={`text-[10px] mt-0.5 ${isHome ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
            홈
          </span>
        </Link>

        {/* 커뮤니티 탭 */}
        <Link href="/community" className="flex flex-col items-center justify-center flex-1 py-2">
          <svg
            className={`w-6 h-6 ${isCommunity ? 'text-orange-500' : 'text-gray-400'}`}
            fill={isCommunity ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isCommunity ? 0 : 1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className={`text-[10px] mt-0.5 ${isCommunity ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
            커뮤니티
          </span>
        </Link>

        {/* 중앙 매치 버튼 (오렌지, 크고 둥근 형태) */}
        <Link href="/match" className="flex flex-col items-center justify-center flex-1">
          <div
            className={`w-14 h-14 -mt-7 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isMatch ? 'bg-orange-600' : 'bg-orange-500'
            }`}
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        </Link>

        {/* 알림 탭 */}
        <Link href="/notifications" className="flex flex-col items-center justify-center flex-1 py-2 relative">
          <svg
            className={`w-6 h-6 ${isNotifications ? 'text-orange-500' : 'text-gray-400'}`}
            fill={isNotifications ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isNotifications ? 0 : 1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className={`text-[10px] mt-0.5 ${isNotifications ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
            알림
          </span>
          {/* 읽지 않은 알림 배지 (추후 활성화) */}
          {/* <span className="absolute top-1 right-3 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span> */}
        </Link>

        {/* 마이페이지 탭 */}
        <Link href="/profile" className="flex flex-col items-center justify-center flex-1 py-2">
          <svg
            className={`w-6 h-6 ${isProfile ? 'text-orange-500' : 'text-gray-400'}`}
            fill={isProfile ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isProfile ? 0 : 1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className={`text-[10px] mt-0.5 ${isProfile ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
            마이페이지
          </span>
        </Link>
      </div>
    </nav>
  );
};
