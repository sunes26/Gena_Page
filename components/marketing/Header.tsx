// components/marketing/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation'; // ✅ 번역 훅 추가

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const { t } = useTranslation(); // ✅ 번역 훅 사용

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 성공 후 홈으로 리다이렉트 (강제 새로고침)
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // 에러 발생 시에도 로컬 상태 초기화를 위해 홈으로 리다이렉트
      // Firebase Auth는 이미 로그아웃되었을 가능성이 높음
      window.location.href = '/';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image
              src="/images/logo.png"
              alt="Gena"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gena
            </span>
          </Link>

          {/* ✅ 데스크톱 네비게이션 - 번역 적용 */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-blue-600 transition">
              {t('marketing.header.features')}
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition">
              {t('marketing.header.howItWorks')}
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition">
              {t('marketing.header.pricing')}
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-blue-600 transition">
              {t('marketing.header.faq')}
            </a>
          </nav>

          {/* ✅ 데스크톱 액션 버튼 - 번역 적용 */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-32 h-9 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
            ) : user ? (
              // 로그인한 상태
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button>{t('marketing.header.dashboard')}</Button>
                </Link>
                
                {/* 프로필 정보 */}
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || t('common.name')}
                        width={32}
                        height={32}
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
                      {user.displayName || t('common.name')}
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
                  title={t('marketing.header.logout')}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('marketing.header.logout')}</span>
                </button>
              </div>
            ) : (
              // 로그인하지 않은 상태
              <>
                <Link href="/login">
                  <Button variant="ghost">{t('marketing.header.login')}</Button>
                </Link>
                <Link href="/signup">
                  <Button>{t('marketing.header.signup')}</Button>
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
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

        {/* ✅ 모바일 메뉴 - 번역 적용 */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('marketing.header.features')}
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('marketing.header.howItWorks')}
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('marketing.header.pricing')}
              </a>
              <a
                href="#faq"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('marketing.header.faq')}
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
                          <Image
                            src={user.photoURL}
                            alt={user.displayName || t('common.name')}
                            width={40}
                            height={40}
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
                          {user.displayName || t('common.name')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">{t('marketing.header.dashboard')}</Button>
                    </Link>

                    {/* 모바일 로그아웃 버튼 */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('marketing.header.logout')}</span>
                    </button>
                  </>
                ) : (
                  // 모바일 - 로그인하지 않은 상태
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        {t('marketing.header.login')}
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">{t('marketing.header.signup')}</Button>
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