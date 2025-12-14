// app/(dashboard)/dashboard/layout.tsx
import { Metadata } from 'next';
import { generatePrivateMetadata } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

export const metadata: Metadata = generatePrivateMetadata(
  pageMetadata.dashboard.ko.title,
  'ko'
);

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
