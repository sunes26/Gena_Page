// app/(auth)/verify-email/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

/**
 * 이메일 인증 페이지 레이아웃
 */

export const metadata: Metadata = genMeta({
  title: pageMetadata.verifyEmail.ko.title,
  description: pageMetadata.verifyEmail.ko.description,
  canonical: '/verify-email',
  noIndex: true,
  locale: 'ko',
});

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
