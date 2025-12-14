// app/(auth)/login/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

/**
 * 로그인 페이지 레이아웃
 *
 * 참고: 페이지가 'use client'를 사용하므로,
 * 메타데이터는 이 레이아웃에서 설정합니다.
 * Layout은 searchParams를 받을 수 없으므로 기본 locale 사용
 */

// 메타데이터 (기본 한국어, ?lang=en 시 클라이언트에서 처리)
export const metadata: Metadata = genMeta({
  title: pageMetadata.login.ko.title,
  description: pageMetadata.login.ko.description,
  canonical: '/login',
  noIndex: false,
  locale: 'ko',
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}