import { supabase } from './supabase';

export async function searchUsersByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, headline, photo_url')
    .eq('role', 'candidate')
    .ilike('email', `%${email}%`)
    .limit(10);
  if (error) throw error;
  return data;
}

export async function sendConnectionRequest(requesterId: string, addresseeId: string) {
  const { data, error } = await supabase
    .from('connections')
    .insert({ requester_id: requesterId, addressee_id: addresseeId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function respondToConnectionRequest(
  connectionId: string,
  status: 'accepted' | 'declined'
) {
  const { data, error } = await supabase
    .from('connections')
    .update({ status })
    .eq('id', connectionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Returns the accepted connections for a user — this is what
 * ConnectionPickerScreen reads from instead of a LinkedIn graph call.
 */
export async function getAcceptedConnections(userId: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*, requester:requester_id(id, name, photo_url), addressee:addressee_id(id, name, photo_url)')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted');
  if (error) throw error;
  return data;
}

export async function getPendingRequests(userId: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*, requester:requester_id(id, name, photo_url)')
    .eq('addressee_id', userId)
    .eq('status', 'pending');
  if (error) throw error;
  return data;
}