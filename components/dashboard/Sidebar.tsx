// components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import {
  LayoutDashboard,
  History,
  CreditCard,
  Settings,
  LogOut,
  X,
  Crown,
  Receipt,
} from 'lucide-react';
import { logout } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface SidebarProps {
  user: User;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  premiumOnly?: boolean;
}

export default function Sidebar({ user, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { isPremium } = useAuth();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: t('dashboard.sidebar.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('dashboard.sidebar.history'),
      href: '/history',
      icon: History,
      premiumOnly: true, // ✅ 프리미엄 전용 표시
    },
    {
      name: t('dashboard.sidebar.subscription'),
      href: '/subscription',
      icon: CreditCard,
    },
    {
      name: t('dashboard.sidebar.billing'),
      href: '/billing',
      icon: Receipt,
    },
    {
      name: t('dashboard.sidebar.settings'),
      href: '/settings',
      icon: Settings,
    },
  ];

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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* 로고 영역 */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt={t('dashboard.sidebar.logo')}
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-gray-900">
            {t('dashboard.sidebar.logo')}
          </span>
        </Link>

        {/* 모바일 닫기 버튼 */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const needsUpgrade = item.premiumOnly && !isPremium;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-lg transition group
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }
                ${needsUpgrade ? 'relative' : ''}
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              
              {/* ✅ 프리미엄 전용 배지 */}
              {item.premiumOnly && !isPremium && (
                <div className="flex items-center space-x-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 프로필 & 로그아웃 영역 */}
      <div className="border-t border-gray-200 p-4">
        {/* 프로필 정보 */}
        <div className="flex items-center space-x-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center relative">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || t('common.name')}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-blue-600 font-semibold text-sm">
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
              </span>
            )}
            {/* ✅ Pro 사용자 배지 */}
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || t('common.name')}
              </p>
              {isPremium && (
                <span className="text-xs font-bold text-yellow-600">PRO</span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('dashboard.sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
}