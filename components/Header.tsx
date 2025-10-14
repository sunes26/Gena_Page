// components/Header.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';

export function Header() {
  const { user, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">
          SummaryGenie
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-6">
          {loading ? (
            <div className="text-gray-500 text-sm">Loading...</div>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                대시보드
              </Link>
              <Link
                href="/history"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                기록
              </Link>

              {/* 사용자 정보 */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-gray-700 font-medium">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                >
                  {loggingOut ? '...' : '로그아웃'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                회원가입
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}