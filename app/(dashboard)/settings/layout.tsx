// app/(dashboard)/settings/layout.tsx
import { Metadata } from 'next';
import { generatePrivateMetadata } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

export const metadata: Metadata = generatePrivateMetadata(
  pageMetadata.settings.ko.title,
  'ko'
);

export default function SettingsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
