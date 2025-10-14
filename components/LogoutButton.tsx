// components/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await logout();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}