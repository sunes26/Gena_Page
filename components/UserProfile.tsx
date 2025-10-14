// components/UserProfile.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';

export function UserProfile() {
  const { user, loading, error } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  // 로딩 중
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error.message}
        </div>
      </div>
    );
  }

  // 로그인하지 않은 상태
  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다</p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            로그인
          </Link>
        </div>
      </div>
    );
  }

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (!confirm('정말 로그아웃 하시겠습니까?')) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
      setLoggingOut(false);
    }
  };

  // 로그인한 상태
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{user.displayName || 'Anonymous'}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition"
        >
          {loggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    </div>
  );
}