// app/(auth)/layout.tsx
import type { Metadata } from 'next';

/**
 * 인증 페이지 그룹 레이아웃
 * 
 * 이 레이아웃은 /login, /signup, /forgot-password 등
 * 인증 관련 페이지들의 공통 설정을 관리합니다.
 * 
 * 참고: 개별 페이지가 'use client'를 사용하므로,
 * 메타데이터는 이 레이아웃에서 설정합니다.
 */

// 기본 메타데이터 (모든 인증 페이지에 공통 적용)
export const metadata: Metadata = {
  robots: {
    index: true,  // 인증 페이지도 검색 결과에 노출
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}