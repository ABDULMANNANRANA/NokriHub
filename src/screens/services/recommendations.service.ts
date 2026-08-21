import { supabase } from './supabase';

export type RequestedBy = 'candidate' | 'recommender';

const DAILY_REQUEST_LIMIT = 20;

export async function createRecommendationRequest(params: {
  jobId: string;
  candidateId: string;
  recommenderId: string;
  requestedBy: RequestedBy;
  note?: string;
  cvId?: string;
}) {
  const initiatorId =
    params.requestedBy === 'candidate' ? params.candidateId : params.recommenderId;

  // rate limit: count requests THIS user has initiated in the last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from('recommendation_requests')
    .select('*', { count: 'exact', head: true })
    .or(
      `and(requested_by.eq.candidate,candidate_id.eq.${initiatorId}),and(requested_by.eq.recommender,recommender_id.eq.${initiatorId})`
    )
    .gte('created_at', since);
  if (countError) throw countError;

  if ((count ?? 0) >= DAILY_REQUEST_LIMIT) {
    throw new Error(
      `You've reached today's limit of ${DAILY_REQUEST_LIMIT} recommendation requests. Please try again tomorrow.`
    );
  }

  const { data, error } = await supabase
    .from('recommendation_requests')
    .insert({
      job_id: params.jobId,
      candidate_id: params.candidateId,
      recommender_id: params.recommenderId,
      requested_by: params.requestedBy,
      note: params.note ?? null,
      cv_id: params.cvId ?? null,
    })
    .select()
    .single();

  if (error) {
    // Postgres unique_violation — the DB-level duplicate guard from 0010
    if (error.code === '23505') {
      throw new Error('You already have a pending request for this job with this person.');
    }
    throw error;
  }
  return data;
}

/**
 * Accepting a request writes the resulting recommendations row.
 * This lives client-side for the MVP; the proposal (Section 6.2) flags
 * multi-step workflows like this as good future Edge Function candidates
 * once the logic needs to be trusted server-side (e.g. once Phase 2's
 * star system depends on it).
 */
export async function respondToRequest(
  requestId: string,
  status: 'accepted' | 'declined',
  cvId?: string
) {
  // for the 'offer' flow, the candidate attaches their CV at accept-time
  // since it wasn't chosen when the request was created
  if (status === 'accepted' && cvId) {
    const { error: cvUpdateError } = await supabase
      .from('recommendation_requests')
      .update({ cv_id: cvId })
      .eq('id', requestId);
    if (cvUpdateError) throw cvUpdateError;
  }

  const { data: request, error } = await supabase
    .from('recommendation_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single();
  if (error) throw error;

  if (status === 'accepted') {
    const { error: recError } = await supabase.from('recommendations').insert({
      request_id: request.id,
      job_id: request.job_id,
      candidate_id: request.candidate_id,
      recommender_id: request.recommender_id,
      cv_id: request.cv_id,
    });
    if (recError) throw recError;
  }

  return request;
}

/** Items where the logged-in user is the one who needs to accept/decline */
export async function getPendingActionItems(userId: string) {
  const { data, error } = await supabase
    .from('recommendation_requests')
    .select(
      '*, cv_id, job:job_id(title), candidate:candidate_id(name), recommender:recommender_id(name)'
    )
    .eq('status', 'pending')
    .or(
      `and(requested_by.eq.candidate,recommender_id.eq.${userId}),and(requested_by.eq.recommender,candidate_id.eq.${userId})`
    );
  if (error) throw error;
  return data;
}

/** Items the logged-in user sent and is waiting on someone else for */
export async function getSentRequests(userId: string) {
  const { data, error } = await supabase
    .from('recommendation_requests')
    .select('*, job:job_id(title), candidate:candidate_id(name), recommender:recommender_id(name)')
    .or(
      `and(requested_by.eq.candidate,candidate_id.eq.${userId}),and(requested_by.eq.recommender,recommender_id.eq.${userId})`
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Full outcome history — accepted recommendations involving this user */
export async function getMyRecommendationHistory(userId: string) {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*, job:job_id(title)')
    .or(`candidate_id.eq.${userId},recommender_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Company side — recommended candidates for a specific job */
export async function getRecommendationsForJob(jobId: string) {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*, candidate:candidate_id(name, photo_url), recommender:recommender_id(name)')
    .eq('job_id', jobId);
  if (error) throw error;
  return data;
}

/** Company side — every recommendation across all of this company's jobs, for the Pipeline screen */
export async function getCompanyRecommendations(companyId: string) {
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id')
    .eq('company_id', companyId);
  if (jobsError) throw jobsError;

  const jobIds = (jobs || []).map((j) => j.id);
  if (jobIds.length === 0) return [];

  const { data, error } = await supabase
    .from('recommendations')
    .select('*, job:job_id(title), candidate:candidate_id(name, photo_url), recommender:recommender_id(name)')
    .in('job_id', jobIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export type PipelineStatus = 'new' | 'reviewed' | 'hired' | 'rejected';

export async function updateRecommendationStatus(id: string, status: PipelineStatus) {
  const { data, error } = await supabase
    .from('recommendations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Marks hired, writes the hires outcome record, AND increments the recommender's star count */
export async function markRecommendationHired(
  recommendationId: string,
  jobId: string,
  recommenderId: string
) {
  const { error: updateError } = await supabase
    .from('recommendations')
    .update({ status: 'hired' })
    .eq('id', recommendationId);
  if (updateError) throw updateError;

  const { error: hireError } = await supabase
    .from('hires')
    .insert({ recommendation_id: recommendationId, job_id: jobId });
  if (hireError) throw hireError;

  const { error: starError } = await supabase.rpc('increment_star_count', {
    target_user_id: recommenderId,
  });
  if (starError) throw starError;
}












