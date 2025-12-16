import { useEffect, useState } from "react";
import { applicationService, Application, Job } from "../api/services";
import { Link } from "react-router-dom";

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await applicationService.getMyApplications({
        status: statusFilter || undefined,
        ordering: '-applied_at',
      });
      
      const appsList = data.results || data;
      setApplications(Array.isArray(appsList) ? appsList : []);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.detail || "Failed to load applications");
    } finally {
      setLoading(false);
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
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getJobTitle = (job: any) => {
    return typeof job === 'object' ? job.title : 'Job';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Applications</h1>
        <p className="text-gray-600">Track your job applications and their status</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
          >
            <option value="">All Applications</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
          <span className="text-sm text-gray-600">
            Total: {applications.length} application{applications.length !== 1 ? 's' : ''}
          </span>
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
          <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-6">Start applying to jobs to see them here</p>
          <Link
            to="/jobs"
            className="inline-block px-6 py-3 bg-accentsecondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      )}

      {/* Applications List */}
      {!loading && !error && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {getJobTitle(application.job)}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      <i className="fas fa-calendar mr-2"></i>
                      Applied: {new Date(application.applied_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(application.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resume:</p>
                  <a
                    href={application.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accentsecondary hover:underline flex items-center gap-2"
                  >
                    <i className="fas fa-file-pdf"></i>
                    View Resume
                  </a>
                </div>
                {application.cover_letter && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cover Letter:</p>
                    <a
                      href={application.cover_letter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accentsecondary hover:underline flex items-center gap-2"
                    >
                      <i className="fas fa-file-alt"></i>
                      View Cover Letter
                    </a>
                  </div>
                )}
              </div>

              {/* Application Timeline */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-2">Application Status:</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${application.status !== 'rejected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {application.status === 'submitted' && 'Your application has been submitted'}
                    {application.status === 'under_review' && 'Your application is being reviewed'}
                    {application.status === 'shortlisted' && 'Congratulations! You have been shortlisted'}
                    {application.status === 'rejected' && 'Unfortunately, your application was not successful'}
                    {application.status === 'accepted' && 'Congratulations! Your application has been accepted'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Summary */}
      {!loading && applications.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{applications.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'under_review').length}
            </p>
            <p className="text-sm text-gray-600">Under Review</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {applications.filter(a => a.status === 'shortlisted').length}
            </p>
            <p className="text-sm text-gray-600">Shortlisted</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'accepted').length}
            </p>
            <p className="text-sm text-gray-600">Accepted</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === 'rejected').length}
            </p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
      )}
    </div>
  );
}
