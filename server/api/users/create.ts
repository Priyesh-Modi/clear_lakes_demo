import { serverSupabaseClient, serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server';
import type { Profile, CreateUserInput } from '~/types/database';

/**
 * POST /api/users/create
 * Creates a new user (admin only)
 * Body: { email: string, password: string, role?: 'basic' | 'admin' }
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const serviceClient = serverSupabaseServiceRole(event);
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

  const body = await readBody<CreateUserInput>(event);

  // Validate required fields
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: email and password are required',
    });
  }

  // Create user using service role client (bypasses RLS)
  const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true, // Auto-confirm email
  });

  if (createError) {
    throw createError({
      statusCode: 500,
      statusMessage: createError.message,
    });
  }

  // Update role if specified
  if (body.role && body.role !== 'basic') {
    const { error: updateError } = await client
      .from('profiles')
      .update({ role: body.role })
      .eq('id', newUser.user.id);

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: updateError.message,
      });
    }
  }

  return { data: { message: 'User created successfully', userId: newUser.user.id }, error: null };
});
