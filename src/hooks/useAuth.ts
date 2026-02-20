// Supabase 인증 관리 훅 (Google 로그인, 세션 추적, 쿠키 동기화)
'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

// 미들웨어에서 인증 여부 확인용 쿠키 설정/삭제
const setAuthCookie = (token: string) => {
  document.cookie = `sb-access-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

const removeAuthCookie = () => {
  document.cookie = 'sb-access-token=; path=/; max-age=0';
};

export const useAuth = () => {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isOnboarded, isLoading, setUser, setAccessToken, setLoading, logout: storeLogout } = useAuthStore();

  // 초기 세션 확인 및 인증 상태 변경 리스너
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setAccessToken(session.access_token);
          setAuthCookie(session.access_token);
          try {
            const userData = await api.getMe(session.access_token);
            setUser(userData as any);
          } catch {
            setUser(null);
          }
        } else {
          removeAuthCookie();
          setLoading(false);
        }
      } catch {
        removeAuthCookie();
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setAccessToken(session.access_token);
          setAuthCookie(session.access_token);
          try {
            const userData = await api.getMe(session.access_token);
            setUser(userData as any);
          } catch {
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          removeAuthCookie();
          storeLogout();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAccessToken(session.access_token);
          setAuthCookie(session.access_token);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setAccessToken, setLoading, storeLogout]);

  // Google OAuth 로그인
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google 로그인 실패:', err);
      throw new Error('Google 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  }, []);

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // 로그아웃 에러 무시
    }
    removeAuthCookie();
    storeLogout();
    router.push('/auth/login');
  }, [router, storeLogout]);

  // 비로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const path = window.location.pathname;
      if (!path.startsWith('/auth/') && path !== '/onboarding') {
        router.push('/auth/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // 온보딩 미완료 시 리다이렉트 (로그인 되어 있지만 닉네임 미설정)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isOnboarded) {
      const path = window.location.pathname;
      if (path !== '/onboarding' && !path.startsWith('/auth/')) {
        router.push('/onboarding');
      }
    }
  }, [isLoading, isAuthenticated, isOnboarded, router]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isOnboarded,
    isLoading,
    signInWithGoogle,
    signOut,
  };
};
