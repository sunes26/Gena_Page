// app/(marketing)/terms/layout.tsx
import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

export const metadata: Metadata = genMeta({
  title: pageMetadata.terms.ko.title,
  description: pageMetadata.terms.ko.description,
  canonical: '/terms',
  locale: 'ko',
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
