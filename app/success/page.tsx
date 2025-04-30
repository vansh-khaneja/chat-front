'use client';

import { markUserAsPremium } from '@/utils/updateUser';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function SuccessPage() {
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    if (typeof userId === 'string') {
      markUserAsPremium({ userId });
      console.log('✅ User marked as premium.');
    }
  }, [userId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold">✅ Payment Successful!</h1>
      <p>Redirecting you to the homepage...</p>
    </div>
  );
}
