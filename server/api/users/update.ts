import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Profile, UpdateProfileInput } from '~/types/database';

/**
 * POST /api/users/update
 * Updates a user's profile (admin only)
 * Body: { userId: string, role?: 'basic' | 'admin', is_banned?: boolean }
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

  const body = await readBody<{ userId: string } & UpdateProfileInput>(event);

  // Validate required fields
  if (!body.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required field: userId',
    });
  }

  // Prevent admin from banning themselves
  if (body.userId === user.id && body.is_banned === true) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot ban yourself',
    });
  }

  // Build update object
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (body.role !== undefined) {
    updateData.role = body.role;
  }

  if (body.is_banned !== undefined) {
    updateData.is_banned = body.is_banned;
  }

  // Update the profile
  const { data, error } = await client
    .from('profiles')
    .update(updateData)
    .eq('id', body.userId)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return { data, error: null };
});
