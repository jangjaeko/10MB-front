// i18n 번역 훅 — t('nav.home') or t('match.waitingCount', { n: 5 })
'use client';

import { useLangStore } from '@/stores/useLangStore';
import { translate, translateInterest, translateRoom, type TranslationKey, type Lang } from '@/lib/i18n';

export const useT = () => {
  const { lang, setLang } = useLangStore();

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string =>
    translate(lang, key, vars);

  const ti = (tag: string): string => translateInterest(lang, tag);

  const tr = (room: { name: string; theme: string }): string => translateRoom(lang, room);

  return { t, ti, tr, lang, setLang };
};

export type { Lang };
