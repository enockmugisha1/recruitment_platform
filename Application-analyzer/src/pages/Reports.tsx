import { useEffect, useState } from "react";
import { jobService, applicationService, Job, Application } from "../api/services";
import { isJobActive } from "../utils/jobStatus";

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  shortlisted: number;
  rejected: number;
  hired: number;
}

export default function Reports() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [jobsData, appsData] = await Promise.all([
          jobService.getAllJobs({ ordering: "-created_at" }),
          applicationService.getAllApplications(),
        ]);

        const jobsList: Job[] = jobsData.results || jobsData || [];
        const appsList: Application[] = appsData.results || appsData || [];

        setJobs(Array.isArray(jobsList) ? jobsList : []);

        setStats({
          totalJobs: jobsList.length,
          activeJobs: jobsList.filter((j) => isJobActive(j)).length,
          totalApplications: appsList.length,
          shortlisted: appsList.filter((a) => a.status === "shortlisted").length,
          rejected: appsList.filter((a) => a.status === "rejected").length,
          hired: appsList.filter((a) => a.status === "accepted").length,
        });
      } catch (err: any) {
        console.error("Error fetching report data:", err);
        setError(err.response?.data?.detail || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <i className="fa-solid fa-spinner loading-spinner text-2xl text-green-600"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-100 p-6 max-w-lg">
        <p className="text-red-600 font-semibold mb-1">Couldn't load reports</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Jobs", value: stats?.totalJobs ?? 0, color: "text-gray-800" },
    { label: "Active Jobs", value: stats?.activeJobs ?? 0, color: "text-green-600" },
    { label: "Total Applications", value: stats?.totalApplications ?? 0, color: "text-blue-600" },
    { label: "Shortlisted", value: stats?.shortlisted ?? 0, color: "text-indigo-600" },
    { label: "Hired", value: stats?.hired ?? 0, color: "text-emerald-600" },
    { label: "Rejected", value: stats?.rejected ?? 0, color: "text-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Per-job breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Jobs Overview</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No jobs to report on yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Job Title</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Posted</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-gray-800">{job.title}</td>
                    <td className="px-5 py-3 text-gray-600">{job.location}</td>
                    <td className="px-5 py-3 text-gray-600 capitalize">{job.job_type?.replace("_", " ")}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isJobActive(job) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isJobActive(job) ? "Active" : "Closed"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}