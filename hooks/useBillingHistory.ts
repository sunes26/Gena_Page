// hooks/useBillingHistory.ts
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/client';

export interface PaymentRecord {
  id: string;
  userId: string;
  transactionId: string;
  subscriptionId: string | null;
  customerId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'refunded';
  method: string;
  paidAt: Timestamp;
  createdAt: Timestamp;
  failureReason?: string;
  refundedAt?: Timestamp;
}

export function useBillingHistory(userId: string | null) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const db = getFirestoreInstance();
        const paymentsRef = collection(db, 'payments');
        const q = query(
          paymentsRef,
          where('userId', '==', userId),
          orderBy('paidAt', 'desc'),
          limit(50) // 최근 50개
        );

        const snapshot = await getDocs(q);
        const paymentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PaymentRecord[];

        setPayments(paymentData);
      } catch (err) {
        console.error('Error fetching billing history:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [userId]);

  return { payments, loading, error };
}
