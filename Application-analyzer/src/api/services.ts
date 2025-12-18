import axios from './axios';

// ============= AUTH SERVICES =============
export const authService = {
  // Register new user
  register: async (userData: {
    email: string;
    password: string;
    password2: string;
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

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await axios.get('/access/jobs/dashboard_stats/');
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

  // Delete application
  deleteApplication: async (applicationId: number) => {
    const response = await axios.delete(`/access/applications/${applicationId}/`);
    return response.data;
  },
};

// ============= PROFILE SERVICES =============
export const profileService = {
  // Job Seeker Profile
  getJobSeekerProfile: async () => {
    const response = await axios.get('/access/job-seeker-profile/');
    return response.data;
  },

  createJobSeekerProfile: async (profileData: FormData) => {
    const response = await axios.post('/access/job-seeker-profile/', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateJobSeekerProfile: async (profileId: number, profileData: FormData) => {
    const response = await axios.put(`/access/job-seeker-profile/${profileId}/`, profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Recruiter Profile
  getRecruiterProfile: async () => {
    const response = await axios.get('/access/recruiter-profile/');
    return response.data;
  },

  createRecruiterProfile: async (profileData: FormData) => {
    const response = await axios.post('/access/recruiter-profile/', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRecruiterProfile: async (profileId: number, profileData: FormData) => {
    const response = await axios.put(`/access/recruiter-profile/${profileId}/`, profileData, {
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

  // Get upcoming events
  getUpcomingEvents: async () => {
    const response = await axios.get('/access/calendar/upcoming/');
    return response.data;
  },
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
  created_at: string;
  updated_at: string;
  recruiter: number;
}

export interface Application {
  id: number;
  job: number | Job;
  applicant: number;
  resume: string;
  cover_letter?: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'accepted';
  applied_at: string;
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
  gender: string;
  website?: string;
  picture?: string;
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
