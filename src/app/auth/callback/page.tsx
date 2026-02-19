// OAuth 콜백 처리 페이지 (세션 확인 후 온보딩 또는 홈으로 리다이렉트)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  // 콜백 세션 처리
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError('로그인 세션을 확인할 수 없습니다.');
          setTimeout(() => router.push('/auth/login'), 2000);
          return;
        }

        setAccessToken(session.access_token);

        // 미들웨어용 쿠키 설정
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

        try {
          const userData = await api.getMe(session.access_token);
          setUser(userData as any);

          // 닉네임 없으면 온보딩으로
          if (!(userData as any).nickname) {
            router.push('/onboarding');
          } else {
            router.push('/');
          }
        } catch {
          // 유저 정보 조회 실패 = 신규 유저이므로 온보딩으로
          router.push('/onboarding');
        }
      } catch {
        setError('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => router.push('/auth/login'), 2000);
      }
    };

    handleCallback();
  }, [router, setUser, setAccessToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-gray-400 text-sm">로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 mt-4">로그인 중...</p>
          </>
        )}
      </div>
    </div>
  );
}
