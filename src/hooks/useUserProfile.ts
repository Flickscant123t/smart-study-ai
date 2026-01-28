import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  isPremium: boolean;
  creditsRemaining: number;
  dailyUses: number;
  lastUsageDate: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else if (data) {
        // Reset daily uses if it's a new day
        const today = new Date().toISOString().split('T')[0];
        const lastDate = data.last_usage_date || today;
        const dailyUses = lastDate < today ? 0 : (data.daily_uses || 0);

        setProfile({
          id: data.id,
          email: data.email || session.user.email || "",
          isPremium: data.is_premium,
          creditsRemaining: data.credits_remaining,
          dailyUses: dailyUses,
          lastUsageDate: data.last_usage_date || today,
        });
      } else {
        setProfile({
          id: session.user.id,
          email: session.user.email || "",
          isPremium: false,
          creditsRemaining: 10,
          dailyUses: 0,
          lastUsageDate: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { profile, loading, refetch: fetchProfile };
};
