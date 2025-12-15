// contexts/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getLocale, setLocale as saveLocale, initializeLocale } from '@/lib/language';
import koTranslations from '@/messages/ko.json';
import enTranslations from '@/messages/en.json';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: typeof koTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

/**
 * Language Provider
 * 앱 전체에 언어 설정을 제공합니다.
 */
export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || 'en');
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const detectedLocale = initializeLocale(searchParams);
      setLocaleState(detectedLocale);
      setMounted(true);
    }
  }, []);

  // 번역 데이터
  const translations = locale === 'ko' ? koTranslations : enTranslations;

  /**
   * 언어 변경 함수
   */
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
  };

  /**
   * 번역 함수
   * @param key - 번역 키 (예: 'auth.login.title')
   * @param params - 동적 값 (예: { name: 'John' })
   * @returns 번역된 문자열
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    try {
      // 키를 점(.)으로 분리하여 중첩 객체 탐색
      const keys = key.split('.');
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key; // 키를 찾지 못하면 키 자체를 반환
        }
      }

      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
      }

      // 파라미터 치환 (예: {name} → John)
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match;
        });
      }

      return value;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
    translations,
  };

  // SSR 시 기본값으로 렌더링, 클라이언트에서 마운트 후 실제 locale 적용
  if (!mounted) {
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage Hook
 * 컴포넌트에서 언어 설정을 사용합니다.
 * 
 * @example
 * const { locale, setLocale, t } = useLanguage();
 * const title = t('auth.login.title');
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}