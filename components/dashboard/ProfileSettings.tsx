// components/dashboard/ProfileSettings.tsx
'use client';

import { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { User as UserIcon, Upload, Loader2, Camera, X } from 'lucide-react';
import { updateUserProfile, uploadAndUpdateProfilePhoto } from '@/lib/auth';
import { showSuccess, showError } from '@/lib/toast-helpers';
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';

interface ProfileSettingsProps {
  user: User;
  onUpdate: () => void;
}

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const { t, locale } = useTranslation();
  
  // 프로필 정보 상태
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  
  // 이미지 업로드 상태
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // 프로필 업데이트 로딩
  const [profileLoading, setProfileLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showError(locale === 'ko' ? '파일 크기는 2MB 이하여야 합니다.' : 'File size must be under 2MB.');
      return;
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError(locale === 'ko' 
        ? 'JPEG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다.' 
        : 'Only JPEG, PNG, GIF, WEBP images are allowed.');
      return;
    }

    setSelectedFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 업로드 및 프로필 업데이트
  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const downloadURL = await uploadAndUpdateProfilePhoto(
        selectedFile,
        (progress: number) => {
          setUploadProgress(progress);
        }
      );

      setPhotoURL(downloadURL);
      setSelectedFile(null);
      setPreviewURL(null);
      
      showSuccess(t('settings.profile.photoSuccess'));
      onUpdate();
    } catch (error: any) {
      console.error('Image upload error:', error);
      showError(error.message || t('common.error'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 이미지 선택 취소
  const handleCancelImage = () => {
    setSelectedFile(null);
    setPreviewURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 프로필 정보 업데이트
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      showError(locale === 'ko' ? '이름을 입력해주세요.' : 'Please enter your name.');
      return;
    }

    if (displayName.trim() === user.displayName) {
      showError(locale === 'ko' ? '변경된 내용이 없습니다.' : 'No changes to save.');
      return;
    }

    setProfileLoading(true);

    try {
      await updateUserProfile(displayName.trim());
      showSuccess(t('settings.profile.success'));
      onUpdate();
    } catch (error: any) {
      console.error('Profile update error:', error);
      showError(error.message || t('common.error'));
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 프로필 사진 */}
      <div className="pb-8 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('settings.profile.photo')}</h3>
            <p className="text-sm text-gray-500">
              {locale === 'ko' 
                ? '프로필 사진을 변경하세요 (최대 2MB)' 
                : 'Update your profile photo (max 2MB)'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start space-x-6">
          {/* 현재 프로필 사진 */}
          <div className="flex-shrink-0">
            {previewURL ? (
              <div className="relative">
                <Image
                  src={previewURL}
                  alt={t('settings.profile.photo')}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
                <button
                  type="button"
                  onClick={handleCancelImage}
                  className="absolute top-0 right-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : photoURL ? (
              <Image
                src={photoURL}
                alt={displayName || 'Profile'}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center border-4 border-gray-200">
                <UserIcon className="w-16 h-16 text-white" />
              </div>
            )}
          </div>

          {/* 업로드 버튼 */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('settings.profile.uploading')}</span>
                      <span className="font-semibold text-blue-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploading}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('settings.profile.uploading')}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {locale === 'ko' ? '업로드' : 'Upload'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelImage}
                    disabled={uploading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('settings.profile.uploadPhoto')}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {locale === 'ko' 
                    ? 'JPEG, PNG, GIF, WEBP 형식 (최대 2MB)' 
                    : 'JPEG, PNG, GIF, WEBP formats (max 2MB)'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 프로필 정보 */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('settings.profile.title')}</h3>
            <p className="text-sm text-gray-500">
              {locale === 'ko' 
                ? '이름과 이메일을 관리하세요' 
                : 'Manage your name and email'}
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
            />
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
              {t('settings.profile.emailNote')}
            </p>
          </div>

          {/* 이메일 인증 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ko' ? '이메일 인증 상태' : 'Email Verification Status'}
            </label>
            <div className="flex items-center space-x-2">
              {user.emailVerified ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ {locale === 'ko' ? '인증됨' : 'Verified'}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⚠ {locale === 'ko' ? '미인증' : 'Not Verified'}
                </span>
              )}
            </div>
          </div>

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
        </form>
      </div>
    </div>
  );
}