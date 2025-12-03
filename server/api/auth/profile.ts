import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Profile } from '~/types/database';

/**
 * GET /api/auth/profile
 * Fetches the current user's profile data
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No user logged in',
    });
  }

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return { data: data as Profile, error: null };
});
