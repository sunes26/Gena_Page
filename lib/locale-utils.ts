/**
 * Locale Utility Functions
 * URL 파라미터에서 locale을 가져오는 헬퍼 함수들
 */

import { Locale } from './i18n-metadata';

/**
 * searchParams에서 locale 가져오기
 * @param searchParams - Next.js searchParams
 * @returns locale ('ko' | 'en')
 */
export function getLocaleFromSearchParams(
  searchParams?: { [key: string]: string | string[] | undefined } | null
): Locale {
  if (!searchParams) return 'ko';

  const lang = searchParams.lang;

  if (typeof lang === 'string') {
    return lang === 'en' ? 'en' : 'ko';
  }

  if (Array.isArray(lang) && lang.length > 0) {
    return lang[0] === 'en' ? 'en' : 'ko';
  }

  return 'ko'; // 기본값
}

/**
 * URL에 locale 파라미터 추가
 * @param url - 기본 URL
 * @param locale - 언어 코드
 * @returns locale이 추가된 URL
 */
export function addLocaleToUrl(url: string, locale: Locale): string {
  if (locale === 'ko') return url; // 기본 언어는 파라미터 불필요

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}lang=${locale}`;
}
