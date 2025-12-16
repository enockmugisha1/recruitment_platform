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
      <div className="bg-lightgraybg flex items-center justify-center py-20 mt-5 rounded-lg px-1">
        <p className="text-textdark/50">Loading applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-lightgraybg flex items-center justify-center py-20 mt-5 rounded-lg px-1">
        <p className="text-textdark/50">No applications yet</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-700';
      case 'shortlisted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'accepted':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-lightgraybg candtable place-items-center py-4 mt-5 gap-y-1 rounded-lg px-1">
      <div className="grid grid-cols-subgrid col-span-full justify-items-center text-sm text-textdark/50 font-normal rounded-lg py-2">
        <div className=""></div>
        <div>Applied On</div>
        <div>Job Title</div>
        <div>Status</div>
        <div>Action</div>
      </div>

      {applications.map((app, index) => (
        <div key={app.id}>
          {index > 0 && <div className="col-span-full h-px w-full bg-graybg" />}
          <div className="col-span-full grid grid-cols-subgrid place-items-center hover:bg-graybg py-2 rounded-lg group transition-colors relative">
            <Link to="/candidates" className="flex gap-5 text-textdark justify-self-start pl-5">
              <img 
                src={app.applicant.picture || defpfp} 
                alt="Profile" 
                className="h-10 aspect-square object-cover rounded-full"
              />
              <div className="text-start font-semibold space-y-1.5 w-full">
                <p>{`${app.applicant.user.first_name} ${app.applicant.user.last_name}`}</p>
                <p className="text-xs text-textdark/50">{app.applicant.user.email}</p>
              </div>
            </Link>
            <div className="text-textdark font-semibold">
              {new Date(app.applied_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            <div className="text-sm font-semibold">{app.job.title}</div>
            <div className={`text-sm font-semibold w-36 py-1 text-center rounded-xl ${getStatusColor(app.status)}`}>
              {app.status.replace('_', ' ')}
            </div>
            <button className="text-accentprimary hover:underline text-sm">
              View
            </button>

            <a className="w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0" href="#">
              <i className="fa-solid fa-ellipsis-vertical text-xl w-full text-center"></i>
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}