// lib/currency.ts
/**
 * 통화 포맷팅 유틸리티
 * 국제 사용자 대응을 위한 동적 통화 표시
 */

/**
 * 통화 코드별 심볼 매핑
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  KRW: '₩',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  HKD: 'HK$',
};

/**
 * 통화 코드별 소수점 자릿수
 */
const CURRENCY_DECIMALS: Record<string, number> = {
  KRW: 0, // 한국 원화는 소수점 없음
  JPY: 0, // 일본 엔화도 소수점 없음
  USD: 2,
  EUR: 2,
  GBP: 2,
  CNY: 2,
  AUD: 2,
  CAD: 2,
  SGD: 2,
  HKD: 2,
};

/**
 * ✅ 통화 금액 포맷팅
 *
 * @param amount - 금액 (Paddle 저장 형식: KRW는 실제 금액, USD는 센트 단위)
 * @param currency - 통화 코드 (예: 'KRW', 'USD')
 * @param options - 포맷 옵션
 * @returns 포맷된 금액 문자열
 *
 * @example
 * formatCurrency(9900, 'KRW') // "₩9,900"
 * formatCurrency(1990, 'USD') // "$19.90"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'KRW',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
  } = {}
): string {
  const { showSymbol = true, showCode = false } = options;

  const decimals = CURRENCY_DECIMALS[currency] ?? 2;

  // ✅ KRW와 JPY는 소수점이 없으므로 100으로 나누지 않음
  // 다른 통화는 센트 단위로 저장되므로 100으로 나눔
  const actualAmount = decimals === 0 ? amount : amount / 100;

  // 숫자 포맷팅 (천 단위 콤마)
  const formattedNumber = actualAmount.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // 심볼 추가
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  if (showSymbol && showCode) {
    return `${symbol}${formattedNumber} ${currency}`;
  } else if (showSymbol) {
    return `${symbol}${formattedNumber}`;
  } else if (showCode) {
    return `${formattedNumber} ${currency}`;
  } else {
    return formattedNumber;
  }
}

/**
 * ✅ 구독 가격 정보
 * 환경 변수나 서버에서 가져온 가격으로 대체 가능
 */
export interface PriceInfo {
  amount: number; // 센트 단위
  currency: string;
  interval: 'month' | 'year';
}

/**
 * ✅ 기본 가격 정보 (환경 변수에서 가져오거나 기본값 사용)
 * USD는 센트 단위로 저장 (999 = $9.99)
 * KRW는 실제 금액 그대로 저장 (9900 = ₩9,900)
 */
export const DEFAULT_PRICES: Record<string, PriceInfo> = {
  pro_monthly: {
    amount: parseInt(process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE ?? '999', 10), // $9.99 (999 cents)
    currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'USD',
    interval: 'month',
  },
  pro_yearly: {
    amount: parseInt(process.env.NEXT_PUBLIC_PRO_YEARLY_PRICE ?? '9900', 10), // $99.00 (9900 cents)
    currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'USD',
    interval: 'year',
  },
};

/**
 * ✅ 가격 정보를 사람이 읽기 쉬운 형태로 변환
 *
 * @param priceInfo - 가격 정보
 * @returns 포맷된 가격 문자열 (예: "₩9,900/월")
 */
export function formatPriceWithInterval(priceInfo: PriceInfo): string {
  const formattedAmount = formatCurrency(priceInfo.amount, priceInfo.currency);
  const intervalText = priceInfo.interval === 'month' ? '월' : '년';

  return `${formattedAmount}/${intervalText}`;
}

/**
 * ✅ 통화 심볼 가져오기
 *
 * @param currency - 통화 코드
 * @returns 통화 심볼
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

/**
 * ✅ 사용자 지역에 따른 기본 통화 감지 (선택사항)
 * 향후 geolocation API 연동 시 사용 가능
 */
export function detectUserCurrency(): string {
  // 브라우저 언어 설정 기반
  if (typeof navigator !== 'undefined') {
    const language = navigator.language;

    if (language.startsWith('ko')) return 'KRW';
    if (language.startsWith('ja')) return 'JPY';
    if (language.startsWith('zh')) return 'CNY';
    if (language.startsWith('en-US')) return 'USD';
    if (language.startsWith('en-GB')) return 'GBP';
    if (language.startsWith('en-AU')) return 'AUD';
    if (language.startsWith('en-CA')) return 'CAD';
    if (language.startsWith('de') || language.startsWith('fr') || language.startsWith('it') || language.startsWith('es')) {
      return 'EUR';
    }
  }

  // 기본값
  return 'KRW';
}
