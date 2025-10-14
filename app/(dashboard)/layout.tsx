// app/(dashboard)/layout.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileHeader from '@/components/dashboard/MobileHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 인증 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 로딩 중
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 데스크톱 사이드바 */}
      <Sidebar user={user} />

      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* 모바일 사이드바 */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 모바일 헤더 */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} user={user} />

        {/* 컨텐츠 */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}