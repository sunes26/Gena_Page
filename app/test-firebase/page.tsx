'use client';

import { useEffect, useState } from 'react';
import { getAuthInstance, getFirestoreInstance } from '@/lib/firebase/client';

export default function TestFirebasePage() {
  const [status, setStatus] = useState<string>('Checking...');

  useEffect(() => {
    try {
      const auth = getAuthInstance();
      const db = getFirestoreInstance();

      if (auth && db) {
        setStatus('✅ Firebase connected successfully!');
        console.log('Firebase Auth:', auth);
        console.log('Firebase Firestore:', db);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
      console.error('Firebase connection error:', error);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}