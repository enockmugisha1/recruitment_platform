import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RAJobs from "../features/home/components/RAJobs";
import { jobService, applicationService, Job } from "../api/services";
import { useAuth } from "../context/AuthProvider";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    job_type: '',
    location: '',
    active_only: true,
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is recruiter
  const isRecruiter = user?.role === 'recruiter';

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await jobService.getAllJobs({
        search: filters.search || undefined,
        job_type: filters.job_type || undefined,
        location: filters.location || undefined,
        active_only: filters.active_only,
        ordering: '-created_at',
      });
      
      // Handle paginated response
      if (data.results && Array.isArray(data.results)) {
        setJobs(data.results);
      } else if (Array.isArray(data)) {
        setJobs(data);
      } else {
        setJobs([]);
        setError("Invalid data format received");
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      setError(error.response?.data?.detail || "Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters.active_only]);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="mt-5 px-4 sm:px-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="font-semibold text-xl">Available Jobs</h2>
        {isRecruiter && (
          <button
            onClick={() => navigate('/jobs/create')}
            className="px-4 py-2 bg-accentprimary text-white rounded-lg hover:bg-opacity-90 transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Post New Job
          </button>
        )}
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
            <select
              value={filters.job_type}
              onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            >
              <option value="">All Job Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-accentsecondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <i className="fas fa-search mr-2"></i>
              Search
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active_only"
              checked={filters.active_only}
              onChange={(e) => setFilters({ ...filters, active_only: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="active_only" className="text-sm text-gray-700">
              Show only active jobs
            </label>
          </div>
        </form>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
          <p className="text-sm mt-2">Make sure you're logged in to view jobs.</p>
        </div>
      )}
      
      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No jobs available at the moment.</p>
        </div>
      )}
      
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-accentsecondary mb-2">{job.title}</h3>
              <p className="text-gray-700 mb-2">{job.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Type:</strong> {job.job_type}</p>
                <p><strong>Salary:</strong> {job.salary_range}</p>
                <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-accentsecondary font-semibold">Requirements</summary>
                <p className="mt-2 text-gray-600">{job.requirements}</p>
              </details>
              <p className="text-xs text-gray-500 mt-3">
                Posted: {new Date(job.created_at).toLocaleDateString()}
              </p>
              {!isRecruiter && <ApplyButton jobId={job.id} />}
              {isRecruiter && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/jobs/${job.id}/applications`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    <i className="fas fa-users mr-2"></i>
                    View Applications
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <RAJobs />
    </div>
  )
}

// Apply Button Component with Modal
function ApplyButton({ jobId }: { jobId: number }) {
  const [showModal, setShowModal] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume) {
      setError("Resume is required");
      return;
    }

    setApplying(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('job', jobId.toString());
      formData.append('resume', resume);
      if (coverLetter) {
        formData.append('cover_letter', coverLetter);
      }

      await applicationService.applyForJob(formData);

      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setResume(null);
        setCoverLetter(null);
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error ||
                      err.response?.data?.non_field_errors?.[0] ||
                      "Failed to apply. You may have already applied or don't have a job seeker profile.";
      setError(errorMsg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="mt-3 px-4 py-2 bg-accentsecondary text-white rounded hover:bg-opacity-90 transition-colors"
      >
        Apply Now
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Apply for Job</h3>
            
            {success ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <p className="text-lg font-semibold">Application Submitted!</p>
              </div>
            ) : (
              <form onSubmit={handleApply}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Resume <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Cover Letter (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCoverLetter(e.target.files?.[0] || null)}
                    className="w-full border rounded p-2"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                    disabled={applying}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accentsecondary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
                    disabled={applying}
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}