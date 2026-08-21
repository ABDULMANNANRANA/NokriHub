export interface CVPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary?: string;
}

export interface CVExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CVEducation {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CVData {
  personalInfo: CVPersonalInfo;
  experience: CVExperience[];
  education: CVEducation[];
  skills: string[];
}

export interface CV {
  id: string;
  user_id: string;
  template_id: 'classic' | 'modern';
  data: CVData;
  pdf_url: string | null;
  is_active: boolean;
  created_at: string;
}

export const emptyCVData: CVData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '' },
  experience: [],
  education: [],
  skills: [],
};