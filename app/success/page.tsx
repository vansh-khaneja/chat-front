'use client';

import { markUserAsPremium } from '@/utils/updateUser';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { usePremium } from '@/lib/premium-context';

export default function SuccessPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { refreshPremiumStatus } = usePremium();

  useEffect(() => {
    const updatePremiumStatus = async () => {
      if (typeof userId === 'string') {
        // Mark the user as premium in the backend
        await markUserAsPremium({ userId });
        console.log('✅ User marked as premium.');
        
        // Refresh the premium status in the context so all components update
        await refreshPremiumStatus();
      }
    };
    
    updatePremiumStatus();
  }, [userId, refreshPremiumStatus]);

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