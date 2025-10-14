// lib/firebase/client.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase 설정 타입
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// 환경 변수 검증
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 필수 환경 변수 확인
const validateConfig = (config: FirebaseConfig): void => {
  const requiredKeys: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter((key) => !config[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missingKeys.join(', ')}\n` +
      'Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.'
    );
  }
};

// Firebase 초기화 (싱글톤 패턴)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

/**
 * Firebase 앱 초기화
 * 이미 초기화된 경우 기존 인스턴스 반환
 */
export const initializeFirebase = (): FirebaseApp => {
  // 개발 환경에서만 설정 검증
  if (process.env.NODE_ENV === 'development') {
    validateConfig(firebaseConfig);
  }

  // 이미 초기화된 앱이 있는지 확인 (싱글톤)
  if (!app) {
    const apps = getApps();
    
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } else {
      app = apps[0];
      console.log('✅ Using existing Firebase instance');
    }
  }

  return app;
};

/**
 * Firebase Authentication 인스턴스 가져오기
 */
export const getAuthInstance = (): Auth => {
  if (!auth) {
    const app = initializeFirebase();
    auth = getAuth(app);
  }
  return auth;
};

/**
 * Firestore 인스턴스 가져오기
 */
export const getFirestoreInstance = (): Firestore => {
  if (!db) {
    const app = initializeFirebase();
    db = getFirestore(app);
  }
  return db;
};

/**
 * Firebase Storage 인스턴스 가져오기
 */
export const getStorageInstance = (): FirebaseStorage => {
  if (!storage) {
    const app = initializeFirebase();
    storage = getStorage(app);
  }
  return storage;
};

// Export instances (자동 초기화)
export { app, auth, db, storage };

// 기본 export
export default {
  app: initializeFirebase(),
  auth: getAuthInstance(),
  db: getFirestoreInstance(),
  storage: getStorageInstance(),
};