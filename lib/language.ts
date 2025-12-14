// lib/language.ts
/**
 * 언어 관리 유틸리티
 * - localStorage를 사용하여 사용자 선택 언어 저장
 * - 쿼리 파라미터(?lang=ko or ?lang=en)에서 언어 감지
 * - 기본 언어: en (영어)
 */

export type Locale = 'ko' | 'en';

const STORAGE_KEY = 'gena_locale';
const DEFAULT_LOCALE: Locale = 'en'; // 기본 언어: 영어

/**
 * 현재 선택된 언어 가져오기
 * @returns 'ko' | 'en'
 */
export function getLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') {
      return stored;
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Silently fail - not critical
  }

  return DEFAULT_LOCALE;
}

/**
 * 언어 설정 저장
 * @param locale 'ko' | 'en'
 */
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, locale);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Silently fail - not critical
  }
}

/**
 * URL 쿼리 파라미터에서 언어 감지
 * @param searchParams URLSearchParams 객체
 * @returns 'ko' | 'en' | null
 */
export function detectLocaleFromQuery(searchParams: URLSearchParams): Locale | null {
  const lang = searchParams.get('lang');
  
  if (lang === 'ko' || lang === 'en') {
    return lang;
  }

  return null;
}

/**
 * 브라우저 언어 설정에서 언어 감지 (선택사항)
 * @returns 'ko' | 'en'
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  try {
    const browserLang = navigator.language.toLowerCase();

    // 한국어 브라우저인 경우
    if (browserLang.startsWith('ko')) {
      return 'ko';
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Silently fail - not critical
  }

  return DEFAULT_LOCALE;
}

/**
 * 언어 초기화
 * 1. 쿼리 파라미터 확인 (?lang=ko or ?lang=en) - 최우선
 * 2. 브라우저 언어 확인 (navigator.language) - 항상 확인
 * 3. localStorage 확인 - 브라우저 언어가 한/영이 아닐 경우
 * 4. 기본 언어 사용 (en)
 *
 * @param searchParams URLSearchParams 객체
 * @returns 'ko' | 'en'
 */
export function initializeLocale(searchParams?: URLSearchParams): Locale {
  // 1. 쿼리 파라미터 우선 (수동 선택)
  if (searchParams) {
    const queryLocale = detectLocaleFromQuery(searchParams);
    if (queryLocale) {
      setLocale(queryLocale);
      return queryLocale;
    }
  }

  // 2. 브라우저 언어 확인 (크롬 언어 설정에 따라 자동 전환)
  const browserLocale = detectBrowserLocale();

  // 브라우저가 한국어인 경우 한국어로, 아니면 영어로
  if (browserLocale === 'ko') {
    setLocale('ko');
    return 'ko';
  }

  // 3. localStorage 확인 (브라우저 언어가 en이 아닌 다른 언어인 경우 대비)
  const storedLocale = getLocale();

  // 4. 기본 언어 (en)
  return storedLocale;
}

/**
 * 언어 이름 가져오기
 * @param locale 'ko' | 'en'
 * @returns 언어 이름
 */
export function getLocaleName(locale: Locale): string {
  const names: Record<Locale, string> = {
    ko: '한국어',
    en: 'English',
  };
  return names[locale];
}

/**
 * 언어 플래그 이모지 가져오기
 * @param locale 'ko' | 'en'
 * @returns 플래그 이모지
 */
export function getLocaleFlag(locale: Locale): string {
  const flags: Record<Locale, string> = {
    ko: '🇰🇷',
    en: '🇺🇸',
  };
  return flags[locale];
}