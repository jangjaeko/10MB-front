// 언어 설정 스토어 (브라우저 언어 자동 감지 + localStorage 영속화)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Lang, detectLang } from '@/lib/i18n';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      // 초기값: 브라우저 언어 감지 (SSR 안전)
      lang: typeof window !== 'undefined' ? detectLang() : 'en',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: '10mb-lang',
    }
  )
);
