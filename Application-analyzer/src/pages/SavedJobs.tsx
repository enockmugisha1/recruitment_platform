import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobService, Job } from "../api/services";
import { getSavedJobIds, toggleSavedJob } from "../utils/savedJobs";

export default function SavedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<number[]>(() => getSavedJobIds());

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      try {
        if (savedIds.length === 0) {
          setJobs([]);
          return;
        }
        const results = await Promise.all(
          savedIds.map((id) => jobService.getJob(id).catch(() => null))
        );
        setJobs(results.filter((j): j is Job => j !== null));
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [savedIds]);

  const handleUnsave = (jobId: number) => {
    toggleSavedJob(jobId);
    setSavedIds(getSavedJobIds());
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Saved Jobs</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fa-solid fa-spinner loading-spinner text-2xl text-emerald-600"></i>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <i className="fa-regular fa-bookmark text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No saved jobs yet</h3>
          <p className="text-gray-500 mb-4">
            Tap the bookmark icon on any job in Browse Jobs to save it here.
          </p>
          <Link
            to="/browse-jobs"
            className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between gap-4"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {job.location} · {job.job_type?.replace("_", " ")}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
              </div>
              <button
                onClick={() => handleUnsave(job.id)}
                aria-label="Remove from saved jobs"
                className="shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <i className="fa-solid fa-bookmark text-xl text-emerald-600"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
