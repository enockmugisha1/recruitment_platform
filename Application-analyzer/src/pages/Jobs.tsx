import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobService, profileService, Job } from "../api/services";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isJobActive } from "../utils/jobStatus";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    search: "",
    job_type: "",
    location: "",
    active_only: true,
    ordering: "-created_at",
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await jobService.getAllJobs({
        search: filters.search || undefined,
        job_type: filters.job_type || undefined,
        location: filters.location || undefined,
        active_only: filters.active_only,
        ordering: filters.ordering,
      });

      // Handle paginated response
      let fetchedJobs: Job[] = [];
      if (data.results && Array.isArray(data.results)) {
        fetchedJobs = data.results;
      } else if (Array.isArray(data)) {
        fetchedJobs = data;
      } else {
        setJobs([]);
        setError("Invalid data format received");
        return;
      }

      // This endpoint returns every job in the system, not just this
      // recruiter's own postings — job seekers are meant to see everything
      // via Browse Jobs, but a recruiter managing listings here should
      // only see (and be able to edit/delete) jobs they actually created.
      //
      // Job.recruiter is a foreign key to RecruiterProfile.id — NOT the
      // logged-in User's id from the JWT/localStorage. Those are two
      // different id spaces (a previous version of this filter compared
      // job.recruiter against the User id directly, which meant it never
      // matched and every job silently disappeared). The recruiter's own
      // RecruiterProfile.id has to be looked up first.
      let ownJobs = fetchedJobs;
      try {
        const profileData = await profileService.getRecruiterProfile();
        const profileList = profileData.results || profileData;
        const myProfile = Array.isArray(profileList) ? profileList[0] : null;
        if (myProfile?.id != null) {
          ownJobs = fetchedJobs.filter(
            (job) => String(job.recruiter) === String(myProfile.id)
          );
        }
      } catch (profileError) {
        // No recruiter profile yet (or it failed to load) — fall back to
        // showing everything rather than hiding all jobs on an error.
        console.error("Error loading recruiter profile for job filtering:", profileError);
      }

      setJobs(ownJobs);
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
  }, [filters.active_only, filters.ordering]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      job_type: "",
      location: "",
      active_only: true,
      ordering: "-created_at",
    });
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;

    try {
      await jobService.deleteJob(jobId);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete job");
    }
  };

  const handleDuplicateJob = async (job: Job) => {
    try {
      const duplicateData = {
        title: `${job.title} (Copy)`,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        job_type: job.job_type,
        salary_range: job.salary_range,
        deadline: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      };

      await jobService.createJob(duplicateData);
      toast.success("Job duplicated successfully");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to duplicate job");
    }
  };

  const getJobTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
      internship: "Internship",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <i className="fa-solid fa-briefcase text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Job Listings</h1>
              <p className="text-gray-600 text-sm mt-0.5">Manage and view all job postings</p>
            </div>
          </div>
        </div>
        <Link
          to="/jobs/create"
          className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
        >
          <i className="fa-solid fa-plus"></i>
          Create New Job
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-green-600 to-green-500"></div>
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search by job title, description..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <select
              value={filters.job_type}
              onChange={(e) =>
                setFilters({ ...filters, job_type: e.target.value })
              }
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
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
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active_only"
                  checked={filters.active_only}
                  onChange={(e) =>
                    setFilters({ ...filters, active_only: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor="active_only" className="text-sm text-gray-700 cursor-pointer">
                  Show only active jobs
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={filters.ordering}
                  onChange={(e) => setFilters({ ...filters, ordering: e.target.value })}
                  className="text-sm font-semibold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="deadline">Deadline (Soonest)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2 transition-colors"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm hover:shadow transition-all flex items-center gap-2 font-semibold"
              >
                <i className="fa-solid fa-search"></i>
                Apply Filters
              </button>

              <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${viewMode === "grid"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  title="Grid View"
                >
                  <i className="fa-solid fa-grip"></i>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${viewMode === "list"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  title="List View"
                >
                  <i className="fa-solid fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-20 text-center border border-gray-100">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
              <i className="fa-solid fa-spinner loading-spinner text-4xl text-green-600"></i>
            </div>
          </div>
          <p className="text-gray-800 font-semibold text-lg">Loading your job listings...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-exclamation-circle text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Error Loading Jobs</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm p-20 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="fa-solid fa-briefcase text-5xl text-green-500"></i>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-2">
            No jobs found
          </p>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            Try adjusting your search filters or create a new job posting to get started.
          </p>
          <Link
            to="/jobs/create"
            className="btn-primary inline-flex items-center gap-2 px-8 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
          >
            <i className="fa-solid fa-plus"></i>
            Create New Job
          </Link>
        </div>
      )}

      {/* Jobs Grid/List */}
      {!loading && !error && jobs.length > 0 && (
        <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-green-50 to-transparent px-4 py-3 rounded-lg border-l-4 border-green-500">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Showing <span className="text-green-600 font-bold">{jobs.length}</span> {jobs.length === 1 ? "job" : "jobs"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Active job postings ready for applications</p>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  getJobTypeLabel={getJobTypeLabel}
                  onDelete={() => handleDeleteJob(job.id)}
                  onDuplicate={() => handleDuplicateJob(job)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  getJobTypeLabel={getJobTypeLabel}
                  onDelete={() => handleDeleteJob(job.id)}
                  onDuplicate={() => handleDuplicateJob(job)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Job Card Component (Grid View)
function JobCard({
  job,
  getJobTypeLabel,
  onDelete,
  onDuplicate,
}: {
  job: Job;
  getJobTypeLabel: (type: string) => string;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  // Check if job is "new" (posted within last 48 hours)
  const isNew = new Date().getTime() - new Date(job.created_at).getTime() < 48 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 overflow-hidden flex flex-col group transform hover:-translate-y-1">
      {/* Gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>

      {/* Header */}
      <div className="p-6 flex-1 relative">
        {isNew && (
          <span className="absolute top-5 right-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full z-10 shadow-lg shadow-blue-500/30">
            <i className="fa-solid fa-sparkles mr-1"></i>New
          </span>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-2">
            <h3 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
              {job.title}
            </h3>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-ellipsis-v text-gray-400 group-hover:text-green-500"></i>
            </button>
            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                ></div>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 animate-in zoom-in-95 duration-100">
                  <Link to={`/jobs/${job.id}`} className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm flex items-center gap-3 text-gray-700 transition-colors">
                    <i className="fa-solid fa-eye text-green-500 w-4"></i>
                    View Details
                  </Link>
                  <button className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm flex items-center gap-3 text-gray-700 transition-colors">
                    <i className="fa-solid fa-edit text-blue-500 w-4"></i>
                    Edit Job
                  </button>
                  <button
                    onClick={() => { onDuplicate(); setShowActions(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm flex items-center gap-3 text-gray-700 transition-colors"
                  >
                    <i className="fa-solid fa-copy text-purple-500 w-4"></i>
                    Duplicate
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { onDelete(); setShowActions(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex items-center gap-3 text-red-600 transition-colors"
                  >
                    <i className="fa-solid fa-trash w-4"></i>
                    Delete Job
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <i className="fa-solid fa-map-marker-alt text-green-500"></i>
            <span className="truncate font-medium">{job.location || "Remote"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <i className="fa-solid fa-briefcase text-green-500"></i>
            <span className="font-medium">{getJobTypeLabel(job.job_type)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <i className="fa-solid fa-dollar-sign text-green-500"></i>
            <span className="font-medium">{job.salary_range || "Negotiable"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <i className="fa-solid fa-users text-green-500"></i>
            <span className="font-medium">{Math.floor(Math.random() * 25) + 5} Applicants</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <span
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${isJobActive(job) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gradient-to-r from-red-500 to-red-600 text-white"}`}
        >
          {isJobActive(job) ? "● Active" : "● Closed"}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-2 transition-all group/link"
        >
          View Details
          <i className="fa-solid fa-arrow-right text-xs group-hover/link:translate-x-1 transition-transform"></i>
        </Link>
      </div>
    </div>
  );
}

// Job List Item Component (List View)
function JobListItem({
  job,
  getJobTypeLabel,
  onDelete,
  onDuplicate,
}: {
  job: Job;
  getJobTypeLabel: (type: string) => string;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const isNew = new Date().getTime() - new Date(job.created_at).getTime() < 48 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 overflow-hidden group relative">
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:from-green-100 group-hover:to-green-200 transition-all">
                <i className="fa-solid fa-briefcase text-green-600 text-2xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-green-600 transition-colors">
                    {job.title}
                  </h3>
                  {isNew && (
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-blue-500/30">
                      <i className="fa-solid fa-sparkles mr-1"></i>New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {job.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
                    <i className="fa-solid fa-map-marker-alt text-green-500"></i>
                    {job.location || "Remote"}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
                    <i className="fa-solid fa-briefcase text-green-500"></i>
                    {getJobTypeLabel(job.job_type)}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
                    <i className="fa-solid fa-dollar-sign text-green-500"></i>
                    {job.salary_range || "Negotiable"}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
                    <i className="fa-solid fa-users text-green-500"></i>
                    {Math.floor(Math.random() * 25) + 5} Applicants
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-4 flex-shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
            <span
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${isJobActive(job) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gradient-to-r from-red-500 to-red-600 text-white"}`}
            >
              {isJobActive(job) ? "● Active" : "● Closed"}
            </span>

            <Link
              to={`/jobs/${job.id}`}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all text-sm font-bold flex items-center gap-2 group/link"
            >
              View Details
              <i className="fa-solid fa-arrow-right text-xs group-hover/link:translate-x-1 transition-transform"></i>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-ellipsis-v text-gray-400 group-hover:text-green-500"></i>
              </button>
              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  ></div>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 animate-in zoom-in-95 duration-100">
                    <button className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm flex items-center gap-3 text-gray-700 transition-colors">
                      <i className="fa-solid fa-edit text-blue-500 w-4"></i>
                      Edit Job
                    </button>
                    <button
                      onClick={() => { onDuplicate(); setShowActions(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <i className="fa-solid fa-copy text-purple-500 w-4"></i>
                      Duplicate
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { onDelete(); setShowActions(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex items-center gap-3 text-red-600 transition-colors"
                    >
                      <i className="fa-solid fa-trash w-4"></i>
                      Delete Job
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}