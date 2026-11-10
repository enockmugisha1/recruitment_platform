import axios from './axios';

// ============= AUTH SERVICES =============
export const authService = {
  // Register new user
  register: async (userData: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: 'job_seeker' | 'recruiter';
  }) => {
    const response = await axios.post('/auth/register/', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post('/auth/login/', credentials);
    return response.data;
  },

  // Logout user
  logout: async (refreshToken: string) => {
    const response = await axios.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },

  // Request OTP
  requestOTP: async (email: string, purpose: 'email_verification' | 'password_reset') => {
    const response = await axios.post('/auth/otp/request/', { email, purpose });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email: string, otp_code: string, purpose: string) => {
    const response = await axios.post('/auth/otp/verify/', { email, otp_code, purpose });
    return response.data;
  },

  // Reset password
  resetPassword: async (email: string, otp_code: string, new_password: string) => {
    const response = await axios.post('/auth/password/reset/', {
      email,
      otp_code,
      new_password,
    });
    return response.data;
  },

  // Update user profile
  updateUser: async (userData: any) => {
    const response = await axios.put('/auth/update/', userData);
    return response.data;
  },
};

// ============= JOB SERVICES =============
export const jobService = {
  // Get all jobs (public)
  getAllJobs: async (params?: {
    page?: number;
    search?: string;
    job_type?: string;
    location?: string;
    active_only?: boolean;
    ordering?: string;
  }) => {
    const response = await axios.get('/access/jobs/', { params });
    return response.data;
  },

  // Get single job
  getJob: async (jobId: number) => {
    const response = await axios.get(`/access/jobs/${jobId}/`);
    return response.data;
  },

  // Alias for getJob - for better readability
  getJobById: async (jobId: number) => {
    return jobService.getJob(jobId);
  },

  // Create job (recruiter only)
  createJob: async (jobData: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    job_type: string;
    salary_range?: string;
    deadline: string;
  }) => {
    const response = await axios.post('/access/jobs/', jobData);
    return response.data;
  },

  // Update job
  updateJob: async (jobId: number, jobData: any) => {
    const response = await axios.put(`/access/jobs/${jobId}/`, jobData);
    return response.data;
  },

  // Delete job
  deleteJob: async (jobId: number) => {
    const response = await axios.delete(`/access/jobs/${jobId}/`);
    return response.data;
  },

  // Get job statistics
  getStatistics: async () => {
    const response = await axios.get('/access/jobs/statistics/');
    return response.data;
  },
};

// ============= APPLICATION SERVICES =============
export const applicationService = {
  // Get all applications (job seeker's own applications)
  getMyApplications: async (params?: {
    status?: string;
    ordering?: string;
  }) => {
    const response = await axios.get('/access/applications/', { params });
    return response.data;
  },

  // Get single application
  getApplication: async (applicationId: number) => {
    const response = await axios.get(`/access/applications/${applicationId}/`);
    return response.data;
  },

  // Get all applications (with optional filters)
  getAllApplications: async (params?: {
    job_id?: number;
    status?: string;
    ordering?: string;
  }) => {
    const response = await axios.get('/access/applications/', { params });
    return response.data;
  },

  // Submit job application
  applyForJob: async (applicationData: FormData) => {
    const response = await axios.post('/access/applications/', applicationData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update application
  updateApplication: async (applicationId: number, formData: FormData) => {
    const response = await axios.put(`/access/applications/${applicationId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Recruiter: move an application along the review pipeline
  // (submitted -> under_review -> shortlisted -> accepted, or rejected)
  updateApplicationStatus: async (applicationId: number, status: ApplicationStatus) => {
    const response = await axios.post(`/access/applications/${applicationId}/status/`, { status });
    return response.data as Application;
  },

  // Delete (withdraw) application — applicant only, while still "submitted"
  deleteApplication: async (applicationId: number) => {
    const response = await axios.delete(`/access/applications/${applicationId}/`);
    return response.data;
  },
};

// ============= PROFILE SERVICES =============
export const profileService = {
  // Job Seeker Profile
  getJobSeekerProfile: async () => {
    const response = await axios.get('/profile/job/seeker/');
    return response.data;
  },

  createJobSeekerProfile: async (profileData: FormData) => {
    const response = await axios.post('/profile/job/seeker/', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateJobSeekerProfile: async (profileId: number, profileData: FormData) => {
    const response = await axios.put(`/profile/job/seeker/${profileId}/`, profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Recruiter Profile
  getRecruiterProfile: async () => {
    const response = await axios.get('/profile/job/recruiter/');
    return response.data;
  },

  createRecruiterProfile: async (profileData: FormData) => {
    const response = await axios.post('/profile/job/recruiter/', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRecruiterProfile: async (profileId: number, profileData: FormData) => {
    const response = await axios.put(`/profile/job/recruiter/${profileId}/`, profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ============= CALENDAR SERVICES =============
export const calendarService = {
  // Get all calendar events
  getEvents: async (params?: {
    month?: number;
    year?: number;
    type?: string;
  }) => {
    const response = await axios.get('/access/calendar/', { params });
    return response.data;
  },

  // Get single event
  getEvent: async (eventId: number) => {
    const response = await axios.get(`/access/calendar/${eventId}/`);
    return response.data;
  },

  // Create calendar event
  createEvent: async (eventData: {
    title: string;
    event_type: string;
    date: string;
    candidate?: number;
    location?: string;
    description?: string;
  }) => {
    const response = await axios.post('/access/calendar/', eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (eventId: number, eventData: any) => {
    const response = await axios.put(`/access/calendar/${eventId}/`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (eventId: number) => {
    const response = await axios.delete(`/access/calendar/${eventId}/`);
    return response.data;
  },
};

// ============= AI RESUME ANALYZER SERVICES =============
export const aiResumeService = {
  // Analyze resume with AI
  analyzeResume: async (resumeFile: File) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    const response = await axios.post('/ai/analyze-resume/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Match candidate to job using AI
  matchCandidateToJob: async (applicationId: number) => {
    const response = await axios.post(`/ai/match-candidate/${applicationId}/`);
    return response.data;
  },

  // Get AI recommendations for job
  getJobRecommendations: async (jobId: number) => {
    const response = await axios.get(`/ai/job-recommendations/${jobId}/`);
    return response.data;
  },

  // Bulk analyze applications for a job
  bulkAnalyzeApplications: async (jobId: number) => {
    const response = await axios.post(`/ai/bulk-analyze/${jobId}/`);
    return response.data;
  },
};

// ============= BUSINESS (ThinkGreen Afrika) + COMPANY SERVICES =============
export interface Company {
  id: number;
  name: string;
  website?: string | null;
  description?: string;
  location?: string;
  contact_email?: string;
  logo?: string | null;
  is_active: boolean;
  recruiter_count?: number;
  job_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RecruiterMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_company_admin: boolean;
  is_active: boolean;
  // still on the temporary password => has not set their own yet
  password_change_pending: boolean;
  last_login: string | null;
  jobs_posted: number;
  created_at: string;
}

export interface NewRecruiter {
  first_name: string;
  last_name: string;
  email: string;
  is_company_admin: boolean;
}

/** Returned when a recruiter is created or their password is reset. */
export interface RecruiterCredentials {
  recruiter: RecruiterMember;
  temporary_password: string;
  email_sent: boolean;
}

// Team endpoints are the same shape for the business (any company) and for a
// company admin (their own company); only the base path differs.
const teamApi = (base: string) => ({
  list: async (): Promise<RecruiterMember[]> => (await axios.get(`${base}/`)).data,
  add: async (data: NewRecruiter): Promise<RecruiterCredentials> => (await axios.post(`${base}/`, data)).data,
  update: async (id: number, data: Partial<Pick<RecruiterMember, 'is_company_admin' | 'is_active'>>): Promise<RecruiterMember> =>
    (await axios.patch(`${base}/${id}/`, data)).data,
  resetPassword: async (id: number): Promise<RecruiterCredentials> =>
    (await axios.post(`${base}/${id}/reset-password/`)).data,
});

export type TeamApi = ReturnType<typeof teamApi>;

export const businessService = {
  listCompanies: async (params?: { search?: string }) => {
    const data = (await axios.get('/business/companies/', { params })).data;
    return (data.results ?? data) as Company[];
  },
  getCompany: async (id: number): Promise<Company> => (await axios.get(`/business/companies/${id}/`)).data,
  createCompany: async (data: Partial<Company>): Promise<Company> => (await axios.post('/business/companies/', data)).data,
  updateCompany: async (id: number, data: Partial<Company>): Promise<Company> =>
    (await axios.patch(`/business/companies/${id}/`, data)).data,
  team: (companyId: number) => teamApi(`/business/companies/${companyId}/recruiters`),
};

export const companyService = {
  getMine: async (): Promise<Company & { is_company_admin: boolean }> => (await axios.get('/company/me/')).data,
  updateMine: async (data: Partial<Company>): Promise<Company> => (await axios.patch('/company/me/', data)).data,
  team: teamApi('/company/team'),
};

// ============= TYPES =============
export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  job_type: string;
  salary_range: string;
  deadline: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  recruiter: number;
  // The company the job belongs to (every recruiter of it can manage the job)
  company?: number | null;
  company_name?: string | null;
  posted_by?: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'accepted'
  | 'rejected';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changed_at: string;
  // Only sent to recruiters
  changed_by?: string | null;
}

export interface Application {
  id: number;
  job: number | Job;
  job_title: string;
  applicant: number;
  // Applicant info sent along with the submission
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  years_of_experience?: number;
  education?: string;
  linkedin?: string | null;
  picture?: string | null;
  // Personal details from the applicant's profile
  nationality?: string;
  bio?: string;
  institution_or_company?: string;
  gender?: string;
  date_of_birth?: string | null;
  website?: string | null;
  company_name?: string | null;
  status_history?: StatusHistoryEntry[];
  resume: string;
  cover_letter?: string | null;
  status: ApplicationStatus;
  // What the recruiter may move this application to from its current status
  allowed_next_statuses: ApplicationStatus[];
  applied_at: string;
  submitted_at: string;
}

export interface JobSeekerProfile {
  id: number;
  user: number;
  location: string;
  nationality: string;
  bio: string;
  education: string;
  institution_or_company: string;
  years_of_experience: number;
  phone: string;
  gender: 'M' | 'F' | 'N' | '';  // Male, Female, Prefer not to say
  date_of_birth?: string | null;
  website?: string;
  linkedin?: string;
  picture?: string;
  // Read-only, taken from the user account
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface RecruiterProfile {
  id: number;
  user: number;
  company_name: string;
  company_website?: string;
  company_description?: string;
  company_logo?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  event_type: 'interview' | 'meeting' | 'deadline' | 'other';
  date: string;
  candidate?: number;
  location?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}