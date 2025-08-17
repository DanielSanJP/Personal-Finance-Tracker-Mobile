import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GUEST_USER_ID } from '../lib/guest-protection';

/**
 * Hook to check if current user is guest
 */
export const useGuestCheck = () => {
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsGuest(user?.id === GUEST_USER_ID);
      } catch {
        setIsGuest(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isGuest, loading };
};
