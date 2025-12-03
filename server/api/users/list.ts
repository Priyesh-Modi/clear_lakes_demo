import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Profile } from '~/types/database';

/**
 * GET /api/users/list
 * Fetches all user profiles (admin only)
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  // Get user's profile to check if admin
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw createError({
      statusCode: 500,
      statusMessage: profileError.message,
    });
  }

  const userProfile = profile as Profile;

  // Check if user is admin
  if (userProfile.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Admin access required',
    });
  }

  // Fetch all profiles
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return { data: data as Profile[], error: null };
});
