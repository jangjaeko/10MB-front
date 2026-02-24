import { en, type Translations } from './en';
import { ko } from './ko';

export type Lang = 'ko' | 'en';

export const translations: Record<Lang, Translations> = { ko, en };

// 브라우저 언어 감지 (한국어면 'ko', 나머지는 'en')
export const detectLang = (): Lang => {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  return lang.toLowerCase().startsWith('ko') ? 'ko' : 'en';
};

// 점 표기 키로 값 가져오기 (e.g. 'nav.home')
type DeepKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DeepKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

export type TranslationKey = DeepKeys<Translations>;

const getByPath = (obj: Record<string, any>, path: string): string => {
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return path;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : path;
};

// 템플릿 치환 ({{key}} → value)
const interpolate = (str: string, vars?: Record<string, string | number>): string => {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
};

export const translate = (
  lang: Lang,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string => {
  const dict = translations[lang] as Record<string, any>;
  const raw = getByPath(dict, key);
  return interpolate(raw, vars);
};

// 관심사 태그 번역 (DB 값 → 표시 값)
export const translateInterest = (lang: Lang, tag: string): string => {
  const dict = translations[lang];
  return (dict.interests as Record<string, string>)[tag] ?? tag;
};

export { en, ko };
export type { Translations };
