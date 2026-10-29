import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import defpfp from "../assets/defpfp.svg";
import StatusBadge from "../components/StatusBadge";
import { getAIScore } from "../data/mockAIScores";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../components/Pagination";
import ApplicationStatusControl from "../components/ApplicationStatusControl";
import { Application } from "../api/services";

export default function Candidates() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/access/applications/");
      const appsData = response.data.results || response.data;
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Replace one application in the list after its status changed
  const handleStatusChanged = (updated: Application) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
  };

  // The API now sends the applicant's details with each application
  const getApplicantName = (app: Application) =>
    `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim() || `Candidate #${app.applicant}`;

  const getApplicantEmail = (app: Application) => app.email || "No email provided";

  const getApplicantPicture = (app: Application) => app.picture || defpfp;

  const filteredApplications = applications
    .filter((app) => {
      if (filter !== "all" && app.status !== filter) return false;
      if (searchTerm) {
        const fullName = getApplicantName(app).toLowerCase();
        const email = getApplicantEmail(app).toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
      }
      return true;
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const countOf = (status: string) => applications.filter((a) => a.status === status).length;
  const statuses = [
    { value: "all", label: "All", count: applications.length },
    { value: "submitted", label: "Submitted", count: countOf("submitted") },
    { value: "under_review", label: "Under Review", count: countOf("under_review") },
    { value: "shortlisted", label: "Shortlisted", count: countOf("shortlisted") },
    { value: "accepted", label: "Accepted", count: countOf("accepted") },
    { value: "rejected", label: "Rejected", count: countOf("rejected") },
  ];

  return (
    <div className="h-screen flex flex-col main-bg overflow-hidden">
      <ToastContainer />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        {/* Header with Search and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-bold text-3xl text-gray-800">Candidates Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and review all candidate applications</p>
          </div>
          <button
            onClick={fetchApplications}
            className="btn-primary"
          >
            <i className="fa-solid fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm max-w-md">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-search text-gray-400"></i>
              <input
                type="text"
                placeholder="Search candidates by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 bg-transparent border-none outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setFilter(status.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${filter === status.value
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {status.label} ({status.count})
              </button>
            ))}
          </div>
        </div>

        {/* Candidates Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-20 text-center">
            <i className="fa-solid fa-spinner loading-spinner text-4xl text-green-500 mb-4"></i>
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-20 text-center">
            <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600">No candidates found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Job Applied For
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedApplications.map((app) => {
                    const aiScore = getAIScore(app.id);
                    return (
                      <tr key={app.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={getApplicantPicture(app)}
                              alt="Profile"
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="ml-4">
                              <Link
                                to={`/candidates/${app.id}`}
                                className="text-sm font-semibold text-gray-900 hover:text-green-600"
                              >
                                {getApplicantName(app)}
                              </Link>
                              <div className="text-xs text-gray-500">
                                {getApplicantEmail(app)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }) : "Unknown date"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {app.job_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`text-lg font-bold ${aiScore.score >= 70 ? "text-green-600" :
                              aiScore.score >= 50 ? "text-yellow-600" :
                                "text-red-600"
                              }`}
                          >
                            {aiScore.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={app.status || "submitted"} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-2">
                            <ApplicationStatusControl
                              application={app}
                              onChanged={handleStatusChanged}
                              size="compact"
                            />
                            <Link
                              to={`/candidates/${app.id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}