import ov1 from "../assets/ov1.svg"
import ov2 from "../assets/ov2.svg"
import ov3 from "../assets/ov3.svg"
import ov4 from "../assets/ov4.svg"
import ov5 from "../assets/ov5.svg"
import ov6 from "../assets/ov6.svg"
import ov7 from "../assets/ov7.svg"
import ov8 from "../assets/ov8.svg"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { jobService, applicationService, calendarService } from "../../../api/services"
import { jwtDecode } from "jwt-decode"

interface DashboardStats {
  interviews_scheduled: number;
  feedback_pending: number;
  approvals_pending: number;
  active_jobs: number;
  total_applications: number;
  shortlisted: number;
  hired: number;
  rejected: number;
}

export default function Overview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    interviews_scheduled: 0,
    feedback_pending: 0,
    approvals_pending: 0,
    active_jobs: 0,
    total_applications: 0,
    shortlisted: 0,
    hired: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded: any = jwtDecode(token);
      setUserRole(decoded.role || '');
    }
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch jobs statistics
      const jobsData = await jobService.getStatistics();

      // Fetch applications
      const applicationsData = await applicationService.getMyApplications();
      const applications = applicationsData.results || applicationsData || [];

      // Fetch calendar events
      const eventsData = await calendarService.getEvents({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      const events = eventsData.results || eventsData || [];

      // Count interviews scheduled
      const interviewsScheduled = events.filter(
        (e: any) => e.event_type === 'interview' && new Date(e.date) >= new Date()
      ).length;

      // Count application statuses
      const pending = applications.filter((a: any) => a.status === 'pending').length;
      const shortlisted = applications.filter((a: any) => a.status === 'shortlisted').length;
      const hired = applications.filter((a: any) => a.status === 'hired').length;
      const rejected = applications.filter((a: any) => a.status === 'rejected').length;

      setStats({
        interviews_scheduled: interviewsScheduled,
        feedback_pending: applications.filter((a: any) => a.status === 'interview_scheduled').length,
        approvals_pending: pending,
        active_jobs: jobsData.active_jobs || 0,
        total_applications: applications.length,
        shortlisted,
        hired,
        rejected,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl indent-6 text-gray-800">Overview</h2>
        {userRole === 'recruiter' && (
          <button
            onClick={() => navigate('/jobs/create')}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl flex gap-2 hover:bg-green-700 transition-all shadow-sm hover:shadow font-bold"
          >
            <span className="border-2 w-6 aspect-square rounded-full flex items-center justify-center">
              <i className="fa-solid fa-plus leading-3 block"></i>
            </span>
            Add Job
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 mt-8 gap-x-5 gap-y-12">
        <button
          onClick={() => navigate('/calendar')}
          className="myovelement group text-left"
        >
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              {loading ? '...' : stats.interviews_scheduled}
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov1} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Interview <br /> Scheduled
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </button>

        <button
          onClick={() => navigate('/candidates')}
          className="myovelement group text-left"
        >
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              {loading ? '...' : stats.feedback_pending}
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov2} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Interview Feedback <br /> Pending
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </button>


        <button
          onClick={() => navigate('/candidates')}
          className="myovelement group text-left"
        >
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              {loading ? '...' : stats.approvals_pending}
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov3} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Approval <br /> Pending
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </button>

        <button
          onClick={() => navigate('/jobs')}
          className="myovelement group text-left"
        >
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              {loading ? '...' : stats.active_jobs}
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov4} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Active <br /> Jobs
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </button>

        <button
          onClick={() => navigate('/candidates')}
          className="myovelement group text-left"
        >
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              {loading ? '...' : stats.shortlisted}
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov5} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Candidates <br /> Shortlisted
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </button>

        <button
          onClick={() => navigate('/candidates')}
          className="myovelement group text-left"
        >
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              {loading ? '...' : stats.total_applications}
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov6} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Total <br /> Applications
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </button>

        <button
          onClick={() => navigate('/candidates')}
          className="myovelement group text-left"
        >
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              {loading ? '...' : stats.hired}
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov7} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Candidates <br /> Hired
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </button>

        <button
          onClick={() => navigate('/candidates')}
          className="myovelement group text-left"
        >
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              {loading ? '...' : stats.rejected}
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov8} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Applications <br /> Rejected
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </button>
      </div>
    </>
  )
}