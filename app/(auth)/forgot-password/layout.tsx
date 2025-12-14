// app/(auth)/forgot-password/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

/**
 * 비밀번호 재설정 페이지 레이아웃
 */

export const metadata: Metadata = genMeta({
  title: pageMetadata.forgotPassword.ko.title,
  description: pageMetadata.forgotPassword.ko.description,
  canonical: '/forgot-password',
  noIndex: false,
  locale: 'ko',
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
