// app/(dashboard)/subscription/layout.tsx
import { Metadata } from 'next';
import { generatePrivateMetadata } from '@/lib/metadata';
import { pageMetadata } from '@/lib/i18n-metadata';

export const metadata: Metadata = generatePrivateMetadata(
  pageMetadata.subscription.ko.title,
  'ko'
);

export default function SubscriptionPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
