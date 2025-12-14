// components/dashboard/MobileHeader.tsx
'use client';

import { Menu } from 'lucide-react';
import { User } from 'firebase/auth';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

interface MobileHeaderProps {
  onMenuClick: () => void;
  user: User;
}

export default function MobileHeader({ onMenuClick, user }: MobileHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* 햄버거 메뉴 */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md hover:bg-gray-100 transition"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* 로고 */}
      <div className="flex items-center space-x-2">
        <Image
          src="/images/logo.png"
          alt="Gena"
          width={28}
          height={28}
          className="w-7 h-7"
        />
        <span className="text-lg font-bold text-gray-900">Gena</span>
      </div>

      {/* 프로필 아이콘 */}
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName || t('common.user')}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <span className="text-blue-600 font-semibold text-xs">
            {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
    </header>
  );
}