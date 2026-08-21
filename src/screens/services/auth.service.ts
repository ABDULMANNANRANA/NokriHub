import { supabase } from './supabase';

export type Role = 'candidate' | 'company-admin';

export async function signUp(
  email: string,
  password: string,
  role: Role,
  name?: string
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    await upsertUserRole(data.user.id, role, name, email);
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function upsertUserRole(userId: string, role: Role, name?: string, email?: string) {
  const { error } = await supabase.from('users').upsert({ id: userId, role, name, email });
  if (error) throw error;
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Deletes the user's row (and everything tied to it, via cascading
 * foreign keys) then signs them out. Does NOT delete the underlying
 * Supabase Auth identity — that needs a service-role Edge Function,
 * a future upgrade if full identity deletion is ever required.
 */
export async function deleteMyAccount(userId: string) {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
  await supabase.auth.signOut();
}












