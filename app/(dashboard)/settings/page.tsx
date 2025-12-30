// app/(dashboard)/settings/page.tsx
'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Settings, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import SecuritySettings from '@/components/dashboard/SecuritySettings';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // 로그인 확인
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  // 프로필 업데이트 콜백
  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1);
    // 페이지 새로고침 없이 사용자 정보 갱신
    window.location.reload();
  };

  const tabs = [
    {
      name: '프로필',
      icon: User,
      component: <ProfileSettings key={refreshKey} user={user} onUpdate={handleUpdate} />,
    },
    {
      name: '보안',
      icon: Shield,
      component: <SecuritySettings key={refreshKey} user={user} onUpdate={handleUpdate} />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          <p className="text-sm text-gray-500 mt-1">
            프로필과 보안을 관리하세요
          </p>
        </div>
      </div>

      {/* 탭 UI */}
      <Tab.Group>
        <div className="bg-white rounded-lg shadow">
          {/* 탭 헤더 */}
          <Tab.List className="flex space-x-1 border-b border-gray-200 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-colors relative',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                      selected
                        ? 'text-blue-600 border-b-2 border-blue-600 -mb-[1px]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <Icon
                        className={classNames(
                          'w-5 h-5',
                          selected ? 'text-blue-600' : 'text-gray-400'
                        )}
                      />
                      <span>{tab.name}</span>
                    </>
                  )}
                </Tab>
              );
            })}
          </Tab.List>

          {/* 탭 컨텐츠 */}
          <Tab.Panels className="p-6">
            {tabs.map((tab, idx) => (
              <Tab.Panel
                key={idx}
                className={classNames(
                  'focus:outline-none',
                  'transition-opacity duration-150'
                )}
              >
                {tab.component}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>

      {/* 도움말 카드 */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          도움이 필요하신가요?
        </h3>
        <p className="text-sm text-blue-700 mb-3">
          설정에 대해 궁금한 점이 있으시면 문의해주세요.
        </p>
        <a
          href="mailto:oceancode0321@gmail.com"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
        >
          oceancode0321@gmail.com
        </a>
      </div>
    </div>
  );
}