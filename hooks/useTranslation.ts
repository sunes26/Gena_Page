// hooks/useTranslation.ts
'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Locale } from '@/lib/language';

/**
 * useTranslation Hook
 * 
 * 컴포넌트에서 번역을 쉽게 사용하기 위한 훅입니다.
 * useLanguage의 래퍼로, 더 간결한 API를 제공합니다.
 * 
 * @example
 * ```tsx
 * const { t, locale, setLocale } = useTranslation();
 * 
 * return (
 *   <div>
 *     <h1>{t('auth.login.title')}</h1>
 *     <p>{t('dashboard.home.greeting', { name: user.name })}</p>
 *   </div>
 * );
 * ```
 */
export function useTranslation() {
  const { locale, setLocale, t, translations } = useLanguage();

  return {
    /**
     * 번역 함수
     * @param key - 번역 키 (예: 'auth.login.title')
     * @param params - 동적 값 (예: { name: 'John' })
     */
    t,

    /**
     * 현재 언어 ('ko' | 'en')
     */
    locale,

    /**
     * 언어 변경 함수
     */
    setLocale,

    /**
     * 전체 번역 객체 (직접 접근이 필요한 경우)
     */
    translations,

    /**
     * 한국어인지 확인
     */
    isKorean: locale === 'ko',

    /**
     * 영어인지 확인
     */
    isEnglish: locale === 'en',
  };
}

/**
 * 타입 안전한 번역 키 타입
 * (선택사항: 개발 시 자동완성을 위해 사용)
 */
export type TranslationKey = 
  | `common.${string}`
  | `auth.${string}`
  | `dashboard.${string}`
  | `subscription.${string}`
  | `settings.${string}`
  | `marketing.${string}`;

/**
 * 서버 컴포넌트에서 사용 가능한 번역 헬퍼
 * (제한적 사용 - 클라이언트 컴포넌트 사용 권장)
 */
export function getStaticTranslation(locale: Locale, key: string): string {
  try {
    const translations = locale === 'ko'
      ? require('@/messages/ko.json')
      : require('@/messages/en.json');

    const keys = key.split('.');
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  } catch (error) {
    console.error('Static translation error:', error);
    return key;
  }
}