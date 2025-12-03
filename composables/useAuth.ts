import type { Profile } from '~/types/database';

/**
 * Composable for managing authentication and user profile data
 * This provides reactive access to the current user's profile and auth state
 */
export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Reactive state for user profile
  const profile = useState<Profile | null>('user-profile', () => null);
  const isAdmin = computed(() => profile.value?.role === 'admin');
  const isBanned = computed(() => profile.value?.is_banned === true);

  /**
   * Fetch the current user's profile from the database
   */
  const fetchProfile = async () => {
    if (!user.value) {
      profile.value = null;
      return null;
    }

    try {
      const { data, error } = await $fetch<{ data: Profile; error?: string }>('/api/auth/profile');

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      profile.value = data;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  /**
   * Sign up a new user
   */
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    // Fetch profile after signup
    await fetchProfile();

    return { data, error: null };
  };

  /**
   * Sign in an existing user
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    // Fetch profile after signin
    await fetchProfile();

    return { data, error: null };
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    profile.value = null;

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  /**
   * Check if user is authenticated and not banned
   */
  const canAccess = computed(() => {
    return !!user.value && !isBanned.value;
  });

  return {
    user,
    profile,
    isAdmin,
    isBanned,
    canAccess,
    fetchProfile,
    signUp,
    signIn,
    signOut,
  };
};
