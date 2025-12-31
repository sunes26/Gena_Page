// components/dashboard/ProfileSettings.tsx
'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { User as UserIcon, Loader2, Globe } from 'lucide-react';
import { updateUserProfile } from '@/lib/auth';
import { showSuccess, showError } from '@/lib/toast-helpers';
import { translateAuthError } from '@/lib/auth-errors';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';

interface ProfileSettingsProps {
  user: User;
  onUpdate: () => void;
}

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const { t, locale, setLocale } = useTranslation();
  const { emailVerified } = useAuth(); // ✅ Firestore의 emailVerified 사용
  
  // 프로필 정보 상태
  const [displayName, setDisplayName] = useState(user.displayName || '');
  
  // 프로필 업데이트 로딩
  const [profileLoading, setProfileLoading] = useState(false);

  // 언어 변경 핸들러
  const handleLanguageChange = (newLocale: 'ko' | 'en') => {
    setLocale(newLocale);
    showSuccess(t('settings.profile.languageChanged'));
  };

  // 프로필 정보 업데이트
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      showError(t('settings.profile.nameRequired'));
      return;
    }

    if (displayName.trim() === user.displayName) {
      showError(t('settings.profile.noChanges'));
      return;
    }

    setProfileLoading(true);

    try {
      await updateUserProfile(displayName.trim());
      showSuccess(t('settings.profile.success'));
      onUpdate();
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      // ✅ 에러 메시지 번역 적용
      const errorMessage = translateAuthError(error, t);
      showError(errorMessage || t('common.error'));
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 프로필 정보 */}
      <div className="pb-8 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('settings.profile.title')}</h3>
            <p className="text-sm text-gray-500">
              {t('settings.profile.subtitle')}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4 mt-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.profile.nameLabel')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('settings.profile.namePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={profileLoading}
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('settings.profile.nameHint')}
            </p>
          </div>

          {/* 이메일 (읽기 전용) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.profile.emailLabel')}
            </label>
            <input
              type="email"
              value={user.email || ''}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('settings.profile.emailReadOnly')}
            </p>
          </div>

          {/* 이메일 인증 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.profile.emailVerificationLabel')}
            </label>
            <div className="flex items-center space-x-2">
              {emailVerified ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ {t('settings.profile.verified')}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⚠ {t('settings.profile.notVerified')}
                </span>
              )}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={profileLoading || displayName.trim() === user.displayName}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {profileLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('settings.profile.saving')}
                </>
              ) : (
                <>
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t('settings.profile.saveButton')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 언어 설정 */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('settings.profile.languageTitle')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('settings.profile.languageSubtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('settings.profile.languageLabel')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* 한국어 */}
              <button
                type="button"
                onClick={() => handleLanguageChange('ko')}
                className={`
                  relative flex items-center justify-center px-4 py-3 rounded-lg border-2 
                  transition-all duration-200 font-medium
                  ${locale === 'ko'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-2xl mr-2">🇰🇷</span>
                <span>한국어</span>
                {locale === 'ko' && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`
                  relative flex items-center justify-center px-4 py-3 rounded-lg border-2 
                  transition-all duration-200 font-medium
                  ${locale === 'en'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-2xl mr-2">🇺🇸</span>
                <span>English</span>
                {locale === 'en' && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              {t('settings.profile.languageNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}