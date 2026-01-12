import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import defpfp from "../../../assets/defpfp.svg"
import axios from "../../../api/axios"

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
  };
  status: string;
  applied_at: string;
}

export default function RACands() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get("/access/applications/");
        const appsData = response.data.results || response.data;
        setApplications(Array.isArray(appsData) ? appsData.slice(0, 5) : []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 flex flex-col items-center py-20 mt-6 rounded-2xl px-1 shadow-sm">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
        <p className="text-gray-500 font-medium">Loading applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white border border-gray-100 flex flex-col items-center py-20 mt-6 rounded-2xl px-1 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-users text-2xl text-gray-300"></i>
        </div>
        <p className="text-xl font-bold text-gray-800 mb-2">No applications yet</p>
        <p className="text-gray-500 text-sm">Applications will appear here once candidates apply</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return 'bg-blue-50 text-blue-700';
      case 'under_review':
        return 'bg-yellow-50 text-yellow-700';
      case 'shortlisted':
        return 'bg-green-50 text-green-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      case 'accepted':
      case 'hired':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Applied On</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <Link to={`/candidates/${app.id}`} className="flex items-center gap-3">
                    <img
                      src={app.applicant?.picture || defpfp}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {app.applicant?.user
                          ? `${app.applicant.user.first_name} ${app.applicant.user.last_name}`
                          : "Unknown Candidate"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{app.applicant?.user?.email || "No email"}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 font-semibold">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : "Unknown date"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-800">{app.job?.title || "Untitled Position"}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusColor(app.status || "pending")}`}>
                    {(app.status || "pending").replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/candidates/${app.id}`}
                      className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                    >
                      View
                    </Link>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <i className="fa-solid fa-ellipsis-vertical text-gray-400"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}