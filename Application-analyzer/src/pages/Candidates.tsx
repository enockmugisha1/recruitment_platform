import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import AIResumeAnalyzer from "../components/AIResumeAnalyzer";
import defpfp from "../assets/defpfp.svg";
import "react-toastify/dist/ReactToastify.css";

interface Application {
  id: number;
  job: {
    id: number;
    title: string;
  };
  applicant: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    picture?: string;
    skills?: string[];
  };
  status: string;
  applied_at: string;
  resume?: string;
}

export default function Candidates() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<number | null>(null);

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

  const updateApplicationStatus = async (appId: number, newStatus: string) => {
    try {
      await axios.patch(`/access/applications/${appId}/`, { status: newStatus });
      toast.success(`Application ${newStatus}!`);
      fetchApplications(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update status");
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "submitted":
        return "bg-blue-100 text-blue-700";
      case "under_review":
        return "bg-yellow-100 text-yellow-700";
      case "shortlisted":
        return "bg-green-100 text-green-700";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-700";
      case "hired":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statuses = [
    { value: "all", label: "All Applications", count: applications.length },
    { value: "pending", label: "Pending", count: applications.filter(a => a.status === "pending").length },
    { value: "under_review", label: "Under Review", count: applications.filter(a => a.status === "under_review").length },
    { value: "shortlisted", label: "Shortlisted", count: applications.filter(a => a.status === "shortlisted").length },
    { value: "interview_scheduled", label: "Interview", count: applications.filter(a => a.status === "interview_scheduled").length },
    { value: "hired", label: "Hired", count: applications.filter(a => a.status === "hired").length },
    { value: "rejected", label: "Rejected", count: applications.filter(a => a.status === "rejected").length },
  ];

  return (
    <div className="p-6 md:p-10">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-semibold text-2xl">Candidates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage job applications and candidate profiles
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-accentprimary text-white rounded-lg hover:bg-darkblue transition"
        >
          <i className="fa-solid fa-refresh mr-2"></i>
          Refresh
        </button>
      </div>

      {/* AI Analyzer */}
      <div className="mb-6">
        <AIResumeAnalyzer />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilter(status.value)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === status.value
                  ? "bg-accentprimary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.label} ({status.count})
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-20 text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-accentprimary mb-4"></i>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-20 text-center">
          <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-600">No applications found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={app.applicant.picture || defpfp}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {`${app.applicant.user.first_name} ${app.applicant.user.last_name}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.applicant.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(app.applied_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setSelectedApp(selectedApp === app.id ? null : app.id)
                          }
                          className="text-accentprimary hover:text-darkblue"
                          title="Change Status"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        {app.resume && (
                          <a
                            href={app.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800"
                            title="View Resume"
                          >
                            <i className="fa-solid fa-file-pdf"></i>
                          </a>
                        )}
                      </div>
                      {selectedApp === app.id && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">Change Status:</p>
                          <div className="flex flex-wrap gap-1">
                            {["pending", "under_review", "shortlisted", "interview_scheduled", "hired", "rejected"].map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  updateApplicationStatus(app.id, status);
                                  setSelectedApp(null);
                                }}
                                className={`px-2 py-1 text-xs rounded ${getStatusColor(status)} hover:opacity-80`}
                              >
                                {status.replace("_", " ")}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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