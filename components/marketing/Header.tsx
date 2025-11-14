// components/marketing/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SummaryGenie
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-blue-600 transition">
              기능
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition">
              사용방법
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition">
              요금제
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-blue-600 transition">
              FAQ
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-32 h-9 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
            ) : user ? (
              // 로그인한 상태: 대시보드 버튼 + 프로필 정보 + 로그아웃 버튼
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button>대시보드</Button>
                </Link>
                
                {/* 프로필 정보 */}
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || '사용자'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.displayName || '사용자'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              // 로그인하지 않은 상태: 로그인 + 무료 시작하기 버튼
              <>
                <Link href="/login">
                  <Button variant="ghost">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button>무료 시작하기</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                기능
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                사용방법
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                요금제
              </a>
              <a
                href="#faq"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                {loading ? (
                  <div className="w-full h-9 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
                ) : user ? (
                  // 모바일 - 로그인한 상태
                  <>
                    {/* 프로필 정보 */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || '사용자'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.displayName || '사용자'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">대시보드</Button>
                    </Link>

                    {/* 모바일 로그아웃 버튼 */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  // 모바일 - 로그인하지 않은 상태
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        로그인
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">무료 시작하기</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}