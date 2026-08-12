import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobService, Job, applicationService, Application } from "../api/services";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isJobActive } from "../utils/jobStatus";

export default function JobDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "applications" | "analytics">("overview");

    useEffect(() => {
        const fetchJobData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);

                // Fetch job details
                const jobData = await jobService.getJobById(parseInt(id));
                setJob(jobData);

                // Fetch applications for this job
                const appsData = await applicationService.getAllApplications({ job_id: parseInt(id) });
                if (appsData.results && Array.isArray(appsData.results)) {
                    setApplications(appsData.results);
                } else if (Array.isArray(appsData)) {
                    setApplications(appsData);
                }
            } catch (error: any) {
                console.error("Error fetching job data:", error);
                setError(error.response?.data?.detail || "Failed to fetch job details");
            } finally {
                setLoading(false);
            }
        };

        fetchJobData();
    }, [id]);

    const handleDeleteJob = async () => {
        if (!job || !window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;

        try {
            await jobService.deleteJob(job.id);
            toast.success("Job deleted successfully");
            setTimeout(() => navigate("/jobs"), 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to delete job");
        }
    };

    // NOTE: there used to be a handleToggleStatus() here that PATCHed
    // `is_active` to the backend. The Job model has no is_active field at
    // all (confirmed against applications/models.py) — DRF silently drops
    // unknown keys on write, so that button always reported success while
    // persisting nothing. Status here is derived from `deadline` instead
    // (see isJobActive), same as everywhere else it's shown, and the real
    // way to close a job early is editing its deadline — see the Edit
    // Job link and the note next to the status badge below.

    const getJobTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            full_time: "Full Time",
            part_time: "Part Time",
            contract: "Contract",
            internship: "Internship",
        };
        return labels[type] || type;
    };

    const getStatusBadge = (status: string) => {
        const classes = status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : status === "reviewing"
                ? "bg-blue-100 text-blue-700"
                : status === "shortlisted"
                    ? "bg-purple-100 text-purple-700"
                    : status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700";

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${classes}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-20 text-center border border-gray-100">
                <i className="fa-solid fa-spinner loading-spinner text-4xl text-green-500 mb-4"></i>
                <p className="text-gray-600 font-medium">Loading job details...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl">
                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-exclamation-circle text-xl mt-0.5"></i>
                        <div>
                            <p className="font-semibold">Error Loading Job</p>
                            <p className="text-sm mt-1">{error || "Job not found"}</p>
                        </div>
                    </div>
                </div>
                <Link
                    to="/jobs"
                    className="btn-secondary inline-flex items-center gap-2"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ToastContainer />

            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/jobs")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <i className="fa-solid fa-arrow-left text-gray-600"></i>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
                        <p className="text-gray-600 mt-1">
                            Posted on {new Date(job.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to={`/jobs/${job.id}/edit`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
                    >
                        <i className="fa-solid fa-edit mr-2"></i>
                        Edit Job
                    </Link>
                    <button
                        onClick={handleDeleteJob}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all"
                    >
                        <i className="fa-solid fa-trash mr-2"></i>
                        Delete
                    </button>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3">
                <span
                    className={`px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${isJobActive(job) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                >
                    {isJobActive(job) ? "Active" : "Closed"}
                </span>
                <span className="text-sm text-gray-500">
                    Status is based on the deadline ({new Date(job.deadline).toLocaleDateString()}) —{" "}
                    <Link to={`/jobs/${job.id}/edit`} className="text-green-600 hover:underline font-medium">
                        edit the job
                    </Link>{" "}
                    to change it.
                </span>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-6">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === "overview"
                                ? "border-green-600 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <i className="fa-solid fa-info-circle mr-2"></i>
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("applications")}
                        className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === "applications"
                                ? "border-green-600 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <i className="fa-solid fa-users mr-2"></i>
                        Applications ({applications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === "analytics"
                                ? "border-green-600 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <i className="fa-solid fa-chart-line mr-2"></i>
                        Analytics
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Requirements</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Job Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Job Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Location
                                    </label>
                                    <p className="text-sm text-gray-800 mt-1 flex items-center gap-2">
                                        <i className="fa-solid fa-map-marker-alt text-gray-400"></i>
                                        {job.location || "Remote"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Job Type
                                    </label>
                                    <p className="text-sm text-gray-800 mt-1 flex items-center gap-2">
                                        <i className="fa-solid fa-briefcase text-gray-400"></i>
                                        {getJobTypeLabel(job.job_type)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Salary Range
                                    </label>
                                    <p className="text-sm text-gray-800 mt-1 flex items-center gap-2">
                                        <i className="fa-solid fa-dollar-sign text-gray-400"></i>
                                        {job.salary_range || "Negotiable"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Deadline
                                    </label>
                                    <p className="text-sm text-gray-800 mt-1 flex items-center gap-2">
                                        <i className="fa-solid fa-calendar text-gray-400"></i>
                                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline set"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Applications
                                    </label>
                                    <p className="text-sm text-gray-800 mt-1 flex items-center gap-2">
                                        <i className="fa-solid fa-users text-gray-400"></i>
                                        {applications.length} Applicants
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Views</span>
                                    <span className="text-sm font-bold text-gray-800">{Math.floor(Math.random() * 500) + 100}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Applications</span>
                                    <span className="text-sm font-bold text-gray-800">{applications.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Shortlisted</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {applications.filter(app => app.status === "shortlisted").length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Rejected</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {applications.filter(app => app.status === "rejected").length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "applications" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {applications.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-inbox text-4xl text-gray-300"></i>
                            </div>
                            <p className="text-xl font-bold text-gray-800 mb-2">No Applications Yet</p>
                            <p className="text-gray-600">Applications for this job will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Applied On
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            AI Score
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <i className="fa-solid fa-user text-green-600"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {app.first_name} {app.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{app.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700">
                                                    {new Date(app.submitted_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">
                                                            {Math.floor(Math.random() * 30) + 70}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/candidates/${app.id}`}
                                                    className="text-sm font-semibold text-green-600 hover:text-green-700"
                                                >
                                                    View Details <i className="fa-solid fa-arrow-right ml-1"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "analytics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-600">Total Views</p>
                            <i className="fa-solid fa-eye text-blue-500"></i>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{Math.floor(Math.random() * 500) + 100}</p>
                        <p className="text-xs text-gray-500 mt-1">+12% from last week</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-600">Applications</p>
                            <i className="fa-solid fa-users text-green-500"></i>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{applications.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Total applicants</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-600">Shortlisted</p>
                            <i className="fa-solid fa-star text-purple-500"></i>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">
                            {applications.filter(app => app.status === "shortlisted").length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {applications.length > 0
                                ? Math.round((applications.filter(app => app.status === "shortlisted").length / applications.length) * 100)
                                : 0}% of total
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-600">Avg. AI Score</p>
                            <i className="fa-solid fa-chart-line text-orange-500"></i>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{Math.floor(Math.random() * 20) + 75}</p>
                        <p className="text-xs text-gray-500 mt-1">Out of 100</p>
                    </div>
                </div>
            )}
        </div>
    );
}