import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { FormSubmission, Profile } from '~/types/database';

/**
 * GET /api/submissions/list
 * Fetches form submissions
 * - Basic users: only their own submissions
 * - Admin users: all submissions
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

  // Get user's profile to check role
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

  // Check if user is banned
  if (userProfile.is_banned) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access forbidden - User is banned',
    });
  }

  // Build query based on role
  let query = client.from('form_submissions').select('*');

  // If not admin, only show user's own submissions
  if (userProfile.role !== 'admin') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return { data: data as FormSubmission[], error: null };
});
