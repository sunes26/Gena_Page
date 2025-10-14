// components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import {
  LayoutDashboard,
  History,
  CreditCard,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { logout } from '@/lib/auth';
import Image from 'next/image';

interface SidebarProps {
  user: User;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '요약 기록',
    href: '/history',
    icon: History,
  },
  {
    name: '구독 관리',
    href: '/subscription',
    icon: CreditCard,
  },
  {
    name: '설정',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* 로고 영역 */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt="SummaryGenie"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-gray-900">
            SummaryGenie
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

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg transition
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 프로필 & 로그아웃 영역 */}
      <div className="border-t border-gray-200 p-4">
        {/* 프로필 정보 */}
        <div className="flex items-center space-x-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || '사용자'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-blue-600 font-semibold text-sm">
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.displayName || '사용자'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}