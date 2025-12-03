import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { FormSubmissionInput, Profile } from '~/types/database';

/**
 * POST /api/submissions/create
 * Creates a new form submission
 * Body: FormSubmissionInput
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

  // Get user's profile to check if banned
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

  const body = await readBody<FormSubmissionInput>(event);

  // Validate required fields
  if (!body.full_name || !body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: full_name and email are required',
    });
  }

  // Insert the submission
  const { data, error } = await client
    .from('form_submissions')
    .insert({
      user_id: user.id,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      job_title: body.job_title,
      message: body.message,
      category: body.category,
      priority: body.priority,
    })
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
