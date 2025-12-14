/**
 * Internationalized Metadata
 * 다국어 SEO를 위한 메타데이터 번역
 */

export type Locale = 'ko' | 'en';

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
}

/**
 * 언어별 기본 메타데이터
 */
export const defaultMetadataByLocale: Record<Locale, PageMetadata> = {
  ko: {
    title: 'Gena - AI 웹페이지 요약',
    description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로. AI 기반 웹페이지 요약 서비스로 효율적인 정보 습득을 경험하세요.',
    keywords: [
      'AI 요약',
      '웹페이지 요약',
      '크롬 확장프로그램',
      'ChatGPT',
      '생산성',
      '요약 서비스',
      '한국어 요약',
      '정보 요약',
      '자동 요약',
      '문서 요약',
    ],
  },
  en: {
    title: 'Gena - AI Web Page Summarizer',
    description: 'Cut your browsing time in half while doubling your information depth. Experience efficient information acquisition with our AI-powered web page summarization service.',
    keywords: [
      'AI summary',
      'web page summarizer',
      'Chrome extension',
      'ChatGPT',
      'productivity',
      'summarization service',
      'auto summary',
      'information management',
      'AI tools',
      'text summarizer',
    ],
  },
};

/**
 * 페이지별 메타데이터 번역
 */
export const pageMetadata: Record<string, Record<Locale, PageMetadata>> = {
  // 홈페이지
  home: {
    ko: {
      title: 'Gena - AI 웹페이지 요약',
      description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로. Chrome 확장 프로그램으로 한 번의 클릭으로 웹페이지를 AI가 요약합니다. 무료로 시작하세요.',
      keywords: [
        'AI 요약',
        '웹페이지 요약',
        '크롬 확장프로그램',
        'Chrome extension',
        'ChatGPT',
        '생산성 도구',
        '요약 서비스',
        '한국어 요약',
        '자동 요약',
        '정보 관리',
        'AI 도구',
      ],
    },
    en: {
      title: 'Gena - AI Web Page Summarizer',
      description: 'Cut your browsing time in half while doubling your information depth. Summarize any web page with one click using our AI-powered Chrome extension. Start for free.',
      keywords: [
        'AI summary',
        'web page summarizer',
        'Chrome extension',
        'ChatGPT',
        'productivity tool',
        'summarization service',
        'auto summary',
        'information management',
        'AI tools',
        'text summarizer',
      ],
    },
  },

  // 요금제
  pricing: {
    ko: {
      title: '요금제 - 무료로 시작하기',
      description: 'Gena의 Free 플랜(무료)과 Pro 플랜(월 9,900원)을 비교하세요. 무제한 AI 요약, 고성능 엔진, 우선 지원을 제공합니다.',
    },
    en: {
      title: 'Pricing - Start for Free',
      description: 'Compare Gena\'s Free plan and Pro plan (₩9,900/month). Get unlimited AI summaries, high-performance engine, and priority support.',
    },
  },

  // 대시보드
  dashboard: {
    ko: {
      title: '대시보드',
      description: 'Gena 대시보드에서 요약 기록을 확인하고 관리하세요.',
    },
    en: {
      title: 'Dashboard',
      description: 'View and manage your summary history in Gena Dashboard.',
    },
  },

  // 히스토리
  history: {
    ko: {
      title: '요약 기록',
      description: '저장된 웹페이지 요약 기록을 검색하고 관리하세요.',
    },
    en: {
      title: 'Summary History',
      description: 'Search and manage your saved web page summaries.',
    },
  },

  // 설정
  settings: {
    ko: {
      title: '설정',
      description: '계정 설정, 구독 관리, 알림 설정 등을 변경하세요.',
    },
    en: {
      title: 'Settings',
      description: 'Change account settings, manage subscription, and configure notifications.',
    },
  },

  // 구독
  subscription: {
    ko: {
      title: '구독 관리',
      description: 'Pro 플랜 구독을 관리하고 결제 정보를 확인하세요.',
    },
    en: {
      title: 'Subscription Management',
      description: 'Manage your Pro plan subscription and view payment information.',
    },
  },

  // 로그인
  login: {
    ko: {
      title: '로그인',
      description: 'Gena에 로그인하여 AI 요약 서비스를 이용하세요.',
    },
    en: {
      title: 'Sign In',
      description: 'Sign in to Gena and start using AI summarization service.',
    },
  },

  // 회원가입
  signup: {
    ko: {
      title: '회원가입',
      description: '무료로 회원가입하고 AI 웹페이지 요약 서비스를 시작하세요.',
    },
    en: {
      title: 'Sign Up',
      description: 'Sign up for free and start using AI web page summarization service.',
    },
  },

  // 이메일 인증
  verifyEmail: {
    ko: {
      title: '이메일 인증',
      description: '이메일을 인증하여 Gena의 모든 기능을 이용하세요.',
    },
    en: {
      title: 'Verify Email',
      description: 'Verify your email to access all features of Gena.',
    },
  },

  // 비밀번호 찾기
  forgotPassword: {
    ko: {
      title: '비밀번호 재설정',
      description: '비밀번호를 잊으셨나요? 이메일로 재설정 링크를 받으세요.',
    },
    en: {
      title: 'Reset Password',
      description: 'Forgot your password? Receive a reset link via email.',
    },
  },

  // 개인정보처리방침
  privacy: {
    ko: {
      title: '개인정보처리방침',
      description: 'Gena의 개인정보 수집 및 이용 방침을 확인하세요.',
    },
    en: {
      title: 'Privacy Policy',
      description: 'Review Gena\'s privacy and data collection policies.',
    },
  },

  // 이용약관
  terms: {
    ko: {
      title: '이용약관',
      description: 'Gena 서비스 이용약관을 확인하세요.',
    },
    en: {
      title: 'Terms of Service',
      description: 'Review Gena\'s terms of service.',
    },
  },
};

/**
 * Locale 코드를 OpenGraph locale 형식으로 변환
 * @example 'ko' -> 'ko_KR', 'en' -> 'en_US'
 */
export function getOGLocale(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    ko: 'ko_KR',
    en: 'en_US',
  };
  return localeMap[locale];
}

/**
 * Locale 코드를 HTML lang 속성 형식으로 변환
 * @example 'ko' -> 'ko', 'en' -> 'en'
 */
export function getHtmlLang(locale: Locale): string {
  return locale;
}

/**
 * 대체 locale 목록 가져오기
 * @param currentLocale - 현재 locale
 * @returns 현재를 제외한 다른 locale 목록
 */
export function getAlternateLocales(currentLocale: Locale): Locale[] {
  const allLocales: Locale[] = ['ko', 'en'];
  return allLocales.filter(locale => locale !== currentLocale);
}
