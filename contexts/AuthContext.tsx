// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getAuthInstance, getFirestoreInstance } from '@/lib/firebase/client';

/**
 * User Profile 타입 (Firestore users 컬렉션)
 */
export interface UserProfile {
  email: string;
  name: string | null;
  isPremium: boolean;
  subscriptionPlan: 'free' | 'pro';
  emailVerified: boolean;
  photoURL?: string | null;
  createdAt: any;
  updatedAt: any;
}

/**
 * Auth Context 타입
 */
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isPremium: boolean;
  subscriptionPlan: 'free' | 'pro';
  loading: boolean;
  error: Error | null;
}

/**
 * Auth Context 생성
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider 컴포넌트
 * ✅ Firebase Auth + Firestore users 컬렉션 통합
 * 
 * @example
 * // app/layout.tsx
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const auth = getAuthInstance();
      const db = getFirestoreInstance();
      
      let unsubscribeProfile: Unsubscribe | null = null;

      // ✅ Firebase Auth 상태 변경 리스너
      const unsubscribeAuth = onAuthStateChanged(
        auth,
        (authUser) => {
          setUser(authUser);
          
          // ✅ 로그인한 사용자가 있으면 users 컬렉션 실시간 리스너 설정
          if (authUser) {
            const userRef = doc(db, 'users', authUser.uid);
            
            unsubscribeProfile = onSnapshot(
              userRef,
              (docSnapshot) => {
                if (docSnapshot.exists()) {
                  const data = docSnapshot.data() as UserProfile;
                  setUserProfile(data);
                  setError(null);
                  console.log('✅ User profile loaded:', authUser.uid);
                } else {
                  // users 문서가 없으면 기본값 설정
                  console.warn('User profile not found, using defaults');
                  setUserProfile({
                    email: authUser.email || '',
                    name: authUser.displayName || null,
                    isPremium: false,
                    subscriptionPlan: 'free',
                    emailVerified: authUser.emailVerified,
                    photoURL: authUser.photoURL,
                    createdAt: null,
                    updatedAt: null,
                  });
                }
                setLoading(false);
              },
              (err) => {
                console.error('User profile listener error:', err);
                setError(err as Error);
                setLoading(false);
              }
            );
          } else {
            // 로그아웃 시 초기화
            setUserProfile(null);
            setLoading(false);
            setError(null);
            
            // 기존 리스너 해제
            if (unsubscribeProfile) {
              unsubscribeProfile();
              unsubscribeProfile = null;
            }
          }
        },
        (err) => {
          console.error('Auth state change error:', err);
          setError(err as Error);
          setLoading(false);
        }
      );

      // 클린업
      return () => {
        unsubscribeAuth();
        if (unsubscribeProfile) {
          unsubscribeProfile();
        }
      };
    } catch (err) {
      console.error('AuthProvider initialization error:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  // ✅ 계산된 값들
  const isPremium = userProfile?.isPremium || false;
  const subscriptionPlan = userProfile?.subscriptionPlan || 'free';

  const value: AuthContextType = {
    user,
    userProfile,
    isPremium,
    subscriptionPlan,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthContext 훅
 * AuthProvider 내부에서만 사용 가능
 * 
 * @returns AuthContextType - { user, userProfile, isPremium, subscriptionPlan, loading, error }
 * 
 * @example
 * const { user, isPremium, loading } = useAuthContext();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (!user) return <div>Please login</div>;
 * if (isPremium) return <div>Pro features</div>;
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * useAuth 훅 (별칭)
 * useAuthContext와 동일하지만 이름이 더 짧음
 * 
 * @example
 * const { user, isPremium } = useAuth();
 */
export function useAuth(): AuthContextType {
  return useAuthContext();
}