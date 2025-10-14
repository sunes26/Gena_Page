// components/ui/toast.tsx
'use client';

import { Toaster } from 'react-hot-toast';

/**
 * 토스트 알림 컴포넌트
 * - 앱의 루트 레이아웃에 추가
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // 기본 옵션
        duration: 3000,
        
        // 스타일
        style: {
          background: '#fff',
          color: '#374151',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontSize: '14px',
          maxWidth: '400px',
        },
        
        // 성공 토스트
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #D1FAE5',
          },
        },
        
        // 에러 토스트
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #FEE2E2',
          },
        },
        
        // 로딩 토스트
        loading: {
          iconTheme: {
            primary: '#3B82F6',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}