/**
 * Global authentication middleware
 * Ensures only logged-in, non-banned users can access the app
 * Redirects to /auth if not authenticated
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();

  // Allow access to auth page without login
  if (to.path === '/auth') {
    // If already logged in, redirect to home
    if (user.value) {
      return navigateTo('/');
    }
    return;
  }

  // Require authentication for all other pages
  if (!user.value) {
    return navigateTo('/auth');
  }

  // Fetch and check user profile (banned status)
  try {
    const { data, error } = await $fetch<{ data: any; error?: string }>('/api/auth/profile');

    if (error || !data) {
      // Profile not found, redirect to auth
      return navigateTo('/auth');
    }

    // Check if user is banned
    if (data.is_banned) {
      // Sign out banned user and redirect
      const supabase = useSupabaseClient();
      await supabase.auth.signOut();
      return navigateTo('/auth?error=banned');
    }
  } catch (error) {
    console.error('Error checking user profile:', error);
    // On error, allow navigation but log the issue
  }
});
