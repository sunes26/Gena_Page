// app/(auth)/signup/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

/**
 * 회원가입 페이지 레이아웃
 */

export const metadata: Metadata = genMeta({
  title: pageMetadata.signup.ko.title,
  description: pageMetadata.signup.ko.description,
  canonical: '/signup',
  noIndex: false,
  locale: 'ko',
});

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
