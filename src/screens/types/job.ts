export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  employment_type: string;
  salary_band: string | null;
  status: 'open' | 'closed';
  created_at: string;
}

export interface JobInput {
  title: string;
  description: string;
  skills: string[];
  location: string;
  employment_type: string;
  salary_band: string;
}

export const emptyJobInput: JobInput = {
  title: '',
  description: '',
  skills: [],
  location: '',
  employment_type: 'Full-time',
  salary_band: '',
};












