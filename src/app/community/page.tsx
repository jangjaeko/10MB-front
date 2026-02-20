// 커뮤니티 페이지 (v3에서 구현 예정)
'use client';

import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

export default function CommunityPage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading || !isAuthenticated) return null;

  return (
    <>
      <Header title="커뮤니티" />
      <div className="pt-16 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-5xl mb-4">🚧</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">준비 중이에요</h2>
        <p className="text-gray-500 text-sm">곧 만나요!</p>
      </div>
    </>
  );
}
