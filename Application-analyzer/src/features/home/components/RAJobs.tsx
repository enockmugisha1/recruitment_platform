import { useEffect, useState } from "react"
import caseIcon from "../../../assets/caseIcon.svg"
import { useNavigate } from "react-router-dom"
import axios from "../../../api/axios"

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  job_type: string;
  salary_range: string;
  deadline: string;
  created_at: string;
  applications_count?: number;
}

export default function RAJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("/access/jobs/");
        const jobsData = response.data.results || response.data;
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 flex flex-col items-center py-20 mt-6 rounded-2xl px-1 shadow-sm">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
        <p className="text-gray-500 font-medium">Loading jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0)
    return (
      <div className="bg-white border border-gray-100 flex flex-col items-center py-20 mt-6 rounded-2xl px-1 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-briefcase text-2xl text-gray-300"></i>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">No current job listings</h1>
        <p className="text-gray-500 text-sm mb-6">Start by creating your first job posting</p>
        <button
          onClick={() => navigate('/jobs/create')}
          className="px-6 py-2.5 text-sm bg-green-600 text-white rounded-xl flex items-center gap-2 hover:bg-green-700 transition-all shadow-sm font-bold"
        >
          <i className="fa-solid fa-plus"></i>
          Add Job
        </button>
      </div>
    )

  const calculateDaysAgo = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Salary Range</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Deadline</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Applications</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobs.map((job) => {
              const daysAgo = calculateDaysAgo(job.created_at);
              return (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img src={caseIcon} alt="Job" className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{job.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{daysAgo} days ago</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{job.location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold capitalize">
                      {job.job_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{job.salary_range || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(job.deadline).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                      {job.applications_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                      >
                        View
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <i className="fa-solid fa-ellipsis-vertical text-gray-400"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}