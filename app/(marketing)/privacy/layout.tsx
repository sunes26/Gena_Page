// app/(marketing)/privacy/layout.tsx
import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

export const metadata: Metadata = genMeta({
  title: pageMetadata.privacy.ko.title,
  description: pageMetadata.privacy.ko.description,
  canonical: '/privacy',
  locale: 'ko',
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
