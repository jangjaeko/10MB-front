// 인증 상태 관리 스토어 (유저 정보, 토큰, 로그인 상태 영속화)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // 온보딩 완료 여부 (닉네임 설정 여부로 판단)
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isOnboarded: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isOnboarded: !!user?.nickname,
          isLoading: false,
        }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isOnboarded: false,
          isLoading: false,
        }),
    }),
    {
      name: '10mb-auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    }
  )
);
