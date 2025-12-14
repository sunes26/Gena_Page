// app/(dashboard)/history/layout.tsx
import { Metadata } from 'next';
import { generatePrivateMetadata } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

export const metadata: Metadata = generatePrivateMetadata(
  pageMetadata.history.ko.title,
  'ko'
);

export default function HistoryPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
