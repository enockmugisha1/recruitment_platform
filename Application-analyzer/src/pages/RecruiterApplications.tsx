import { useEffect, useState } from "react";
import axios from "../api/axios";

interface Application {
  id: number;
  job: {
    id: number;
    title: string;
  };
  applicant: {
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    phone: string;
    location: string;
    years_of_experience: number;
  };
  resume: string;
  cover_letter?: string;
  status: string;
  applied_at: string;
}

export default function RecruiterApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      fetchApplications();
    }
  }, [selectedJob, selectedStatus]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/access/jobs/');
      const jobsData = response.data.results || response.data;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch applications for all jobs owned by this recruiter
      const allApplications: Application[] = [];
      
      for (const job of jobs) {
        try {
          const response = await axios.get(`/access/jobs/${job.id}/applications/`);
          const jobApps = response.data.results || response.data;
          if (Array.isArray(jobApps)) {
            allApplications.push(...jobApps);
          }
        } catch (err) {
          console.log(`No applications for job ${job.id}`);
        }
      }

      // Filter by job if selected
      let filteredApps = allApplications;
      if (selectedJob) {
        filteredApps = filteredApps.filter(app => app.job.id.toString() === selectedJob);
      }

      // Filter by status if selected
      if (selectedStatus) {
        filteredApps = filteredApps.filter(app => app.status === selectedStatus);
      }

      setApplications(filteredApps);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.detail || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      await axios.patch(`/access/applications/${applicationId}/`, { status: newStatus });
      
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Review' },
      shortlisted: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shortlisted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
    };

    const config = statusConfig[status] || statusConfig.submitted;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Applications</h1>
        <p className="text-gray-600">Review and manage job applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Job</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="bg-blue-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-accentsecondary mb-4"></i>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && applications.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applications Found</h3>
          <p className="text-gray-600">There are no applications matching your filters</p>
        </div>
      )}

      {/* Applications Table */}
      {!loading && !error && applications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Job Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {application.applicant.user.first_name} {application.applicant.user.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{application.applicant.user.email}</p>
                        <p className="text-sm text-gray-600">{application.applicant.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{application.job.title}</p>
                      <p className="text-sm text-gray-600">{application.applicant.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">{application.applicant.years_of_experience} years</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">
                        {new Date(application.applied_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a
                          href={application.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="View Resume"
                        >
                          <i className="fas fa-file-pdf"></i>
                        </a>
                        {application.cover_letter && (
                          <a
                            href={application.cover_letter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="View Cover Letter"
                          >
                            <i className="fas fa-file-alt"></i>
                          </a>
                        )}
                        <select
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                          className="ml-2 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accentsecondary"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="accepted">Accepted</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
