// app/(dashboard)/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩이 끝났는데 사용자가 없으면 로그인 페이지로
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user.displayName || 'User'}!
      </h1>
      <p className="text-gray-600">User ID: {user.uid}</p>
      <p className="text-gray-600">Email: {user.email}</p>
      <p className="text-gray-600">
        Email Verified: {user.emailVerified ? 'Yes' : 'No'}
      </p>
    </div>
  );
}