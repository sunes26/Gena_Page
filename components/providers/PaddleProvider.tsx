// components/providers/PaddleProvider.tsx
'use client';

import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import Script from 'next/script';

/**
 * Paddle SDK Type Definitions
 */
interface PaddleEvent {
  name: string;
  data?: unknown;
}

interface PaddleSetupOptions {
  token: string;
  eventCallback?: (event: PaddleEvent) => void;
}

interface PaddleSDK {
  Environment?: {
    set: (env: 'sandbox' | 'production') => void;
  };
  Setup: (options: PaddleSetupOptions) => void;
}

/**
 * Paddle Context
 */
interface PaddleContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

const PaddleContext = createContext<PaddleContextType>({
  isReady: false,
  isLoading: true,
  error: null,
});

/**
 * Paddle 상태 훅
 */
export function usePaddleStatus() {
  return useContext(PaddleContext);
}

/**
 * ✅ 수정된 Paddle Provider
 * - Paddle.Environment.set() 사용하여 환경 설정
 * - 올바른 Paddle.js v2 초기화
 * - TypeScript 타입 충돌 해결
 */
export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paddle 환경 설정
  const paddleEnv = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
  const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  /**
   * Paddle 초기화 함수
   */
  const initializePaddle = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // 토큰 검증
    if (!paddleToken) {
      const errorMsg = 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN이 설정되지 않았습니다.';
      console.error('❌', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    // Paddle 객체 확인
    const paddle = (window as Window & { Paddle?: PaddleSDK }).Paddle;
    if (!paddle) {
      console.warn('⚠️ Paddle 객체가 아직 로드되지 않았습니다.');
      return;
    }

    // 이미 초기화된 경우 스킵
    if (isReady) {
      return;
    }

    try {
      // ✅ Sandbox 환경 설정 (Setup 전에 호출해야 함)
      if (paddleEnv === 'sandbox' && paddle.Environment) {
        paddle.Environment.set('sandbox');
      }

      // ✅ Paddle.js v2 초기화 옵션
      const options = {
        token: paddleToken,
        // 이벤트 콜백
        eventCallback: (event: PaddleEvent) => {
          // 에러 이벤트
          if (event.name === 'checkout.error') {
            console.error('❌ Checkout error:', event.data);
          }
        },
      };

      // ✅ Paddle 초기화
      paddle.Setup(options);

      setIsReady(true);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Paddle 초기화 실패';
      console.error('❌ Paddle 초기화 오류:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [paddleEnv, paddleToken, isReady]);

  useEffect(() => {
    // Paddle 스크립트가 이미 로드되어 있으면 바로 초기화
    if ((window as Window & { Paddle?: PaddleSDK }).Paddle) {
      initializePaddle();
      return;
    }

    // Paddle 스크립트 로드 대기
    let checkCount = 0;
    const maxChecks = 100; // 10초 (100ms * 100)

    const checkPaddle = setInterval(() => {
      checkCount++;

      if ((window as Window & { Paddle?: PaddleSDK }).Paddle) {
        clearInterval(checkPaddle);
        initializePaddle();
      } else if (checkCount >= maxChecks) {
        clearInterval(checkPaddle);
        const errorMsg = 'Paddle 스크립트 로드 타임아웃 (10초)';
        console.error('❌', errorMsg);
        setError(errorMsg);
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearInterval(checkPaddle);
    };
  }, [paddleEnv, paddleToken, initializePaddle]);

  return (
    <PaddleContext.Provider value={{ isReady, isLoading, error }}>
      {/* ✅ Paddle.js v2 스크립트 로드 */}
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={() => {
          // 스크립트 로드 완료 후 초기화 시도
          setTimeout(initializePaddle, 100);
        }}
        onError={(e) => {
          const errorMsg = 'Paddle.js 스크립트 로드 실패';
          console.error('❌', errorMsg, e);
          setError(errorMsg);
          setIsLoading(false);
        }}
      />
      
      {children}
    </PaddleContext.Provider>
  );
}