import { supabase } from './supabase';
import type { Job, JobInput } from '../types/job';

export async function createJob(companyId: string, input: JobInput) {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ company_id: companyId, ...input })
    .select()
    .single();
  if (error) throw error;
  return data as Job;
}

export async function updateJob(jobId: string, input: Partial<JobInput>) {
  const { data, error } = await supabase
    .from('jobs')
    .update(input)
    .eq('id', jobId)
    .select()
    .single();
  if (error) throw error;
  return data as Job;
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);
  if (error) throw error;
}

/** Closes/reopens a job without deleting it — preserves recommendation history */
export async function setJobStatus(jobId: string, status: 'open' | 'closed') {
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select()
    .single();
  if (error) throw error;
  return data as Job;
}

/** Company side — jobs posted by this company account (all statuses, they manage their own) */
export async function listCompanyJobs(companyId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Job[];
}

/** Candidate side — only OPEN jobs, for the Feed screen */
export async function listAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Job[];
}

export async function getJob(jobId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  if (error) throw error;
  return data as Job;
}











