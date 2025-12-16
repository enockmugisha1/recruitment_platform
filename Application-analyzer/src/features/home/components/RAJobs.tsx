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
      <div className="bg-lightgraybg flex flex-col items-center py-40 mt-5 rounded-lg px-1">
        <p className="text-textdark/50">Loading jobs...</p>
      </div>
    );
  }
  
  if (jobs.length === 0)
    return (
      <div className="bg-lightgraybg flex flex-col items-center py-40 mt-5 rounded-lg px-1 font-semibold text-textdark">
        <h1 className="text-2xl">No current Job listings</h1>
        <button 
          onClick={() => navigate('/jobs/create')}
          className="px-3 py-2 mt-3 text-sm bg-accentprimary text-white rounded-lg flex items-center gap-2 hover:bg-darkblue transition group"
        >
          <span className="border-2 w-6 aspect-square rounded-full flex items-center justify-center">
            <i className="fa-solid fa-plus leading-3 block"></i>
          </span>
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
    <div className="bg-lightgraybg jobtable place-items-center pt-4 pb-2 mt-5 gap-y-1 rounded-lg px-1 font-semibold text-textdark/50">
      <div className="grid grid-cols-subgrid col-span-full justify-items-center text-sm text-textdark/50 font-normal rounded-lg py-2">
        <div className=""></div>
        <div>Location</div>
        <div>Type</div>
        <div>Salary Range</div>
        <div>Deadline</div>
        <div className="w-36 text-center">Applications</div>
        <div className="">Action</div>
      </div>

      {jobs.map((job, index) => {
        const daysAgo = calculateDaysAgo(job.created_at);
        return (
          <div key={job.id}>
            {index > 0 && <div className="col-span-7 h-px w-full bg-graybg" />}
            <div className="col-span-full grid grid-cols-subgrid place-items-center hover:bg-graybg py-2 rounded-lg group transition-colors relative">
              <div className="flex gap-5 text-textdark justify-self-start pl-5">
                <img src={caseIcon} alt="Case Icon" />
                <div className="text-start font-semibold space-y-1.5 w-full">
                  <p>{job.title}</p>
                  <p className="text-xs text-textdark/50">{daysAgo} days ago</p>
                </div>
              </div>
              <div className="text-textdark text-sm">{job.location}</div>
              <div className="text-sm capitalize">{job.job_type.replace('_', ' ')}</div>
              <div className="text-sm">{job.salary_range || 'N/A'}</div>
              <div className="text-sm">{new Date(job.deadline).toLocaleDateString()}</div>
              <div className="text-textdark">{job.applications_count || 0}</div>
              <button 
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="text-accentprimary hover:underline text-sm"
              >
                View
              </button>

              <a className="w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0" href="#">
                <i className="fa-solid fa-ellipsis-vertical text-xl w-full text-center text-textdark"></i>
              </a>
            </div>
          </div>
        )
      })}

    </div>
  )
}