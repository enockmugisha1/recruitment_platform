import { useState, useEffect } from "react"
import ov1 from "../assets/ov1.svg"
import ov2 from "../assets/ov2.svg"
import ov3 from "../assets/ov3.svg"
import ov4 from "../assets/ov4.svg"
import ov5 from "../assets/ov5.svg"
import ov6 from "../assets/ov6.svg"
import ov7 from "../assets/ov7.svg"
import ov8 from "../assets/ov8.svg"
import { useNavigate } from "react-router-dom"
import axios from "../../../api/axios"
import { toast } from 'react-toastify'

interface DashboardStats {
  interviews_scheduled: number
  feedback_pending: number
  approval_pending: number
  offer_acceptance_pending: number
  documentation_pending: number
  total_candidates: number
  supervisor_allocation_pending: number
  project_allocation_pending: number
}

export default function Overview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    interviews_scheduled: 0,
    feedback_pending: 0,
    approval_pending: 0,
    offer_acceptance_pending: 0,
    documentation_pending: 0,
    total_candidates: 0,
    supervisor_allocation_pending: 0,
    project_allocation_pending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/access/jobs/dashboard_stats/')
      setStats(response.data)
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-semibold text-xl indent-6">Overview</h2>
        <button 
          onClick={() => navigate('/jobs/create')}
          className="px-4 py-2 bg-accentprimary text-white rounded-lg flex gap-2 hover:bg-darkblue transition group text-sm"
        >
          <span className="border-2 w-6 aspect-square rounded-full flex items-center justify-center">
            <i className="fa-solid fa-plus leading-3 block"></i>
          </span>
          Add Job
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-5 gap-4 lg:gap-x-4 lg:gap-y-10">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-accentprimary"></i>
            <p className="mt-3 text-textdark/50">Loading statistics...</p>
          </div>
        ) : (
          <>
            <a className="myovelement group" href="#">
              <div className="mynumwindow">
                <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
                  {stats.interviews_scheduled}
                </span>
              </div>
              <img className="ml-auto w-20 sm:w-24 mt-5" src={ov1} alt="" />
              <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
                Interview <br /> Scheduled
              </p>
              <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
              <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
            </a>

            <a className="myovelement group" href="#">
              <div className="mynumwindow">
                <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
                  {stats.feedback_pending}
                </span>
              </div>
              <img className="ml-auto w-20 sm:w-24 mt-5" src={ov2} alt="" />
              <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
                Interview Feedback <br /> Pending
              </p>
              <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
              <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
            </a>

            <a className="myovelement group" href="#">
              <div className="mynumwindow">
                <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
                  {stats.approval_pending}
                </span>
              </div>
              <img className="ml-auto w-20 sm:w-24 mt-5" src={ov3} alt="" />
              <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
                Approval <br /> Pending
              </p>
              <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
              <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
            </a>

            <a className="myovelement group" href="#">
              <div className="mynumwindow">
                <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
                  {stats.offer_acceptance_pending}
                </span>
              </div>
              <img className="ml-auto w-20 sm:w-24 mt-5" src={ov4} alt="" />
              <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
                Offer Acceptance <br /> Pending
              </p>
              <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
              <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
            </a>

            <a className="myovelement group" href="#">
              <div className="mynumwindow">
                <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
                  {stats.documentation_pending}
                </span>
              </div>
              <img className="ml-auto w-20 sm:w-24 mt-5" src={ov5} alt="" />
              <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
                Documentation <br /> Pending
              </p>
              <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
              <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
            </a>

            <a className="myovelement group" href="/candidates">
              <div className="mynumwindow">
                <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
                  {stats.total_candidates}
                </span>
              </div>
              <img className="ml-auto w-20 sm:w-24 mt-5" src={ov6} alt="" />
              <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
                Total <br /> Candidates
              </p>
              <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
              <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
            </a>

            <a className="myovelement group" href="#">
              <div className="mynumwindow">
                <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
                  {stats.supervisor_allocation_pending}
                </span>
              </div>
              <img className="ml-auto w-20 sm:w-24 mt-5" src={ov7} alt="" />
              <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
                Supervisor Allocation <br /> Pending
              </p>
              <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
              <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
            </a>

            <a className="myovelement group" href="#">
              <div className="mynumwindow">
                <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
                  {stats.project_allocation_pending}
                </span>
              </div>
              <img className="ml-auto w-20 sm:w-24 mt-5" src={ov8} alt="" />
              <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
                Project Allocation <br /> Pending
              </p>
              <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
              <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
            </a>
          </>
        )}
      </div>
    </>
  )
}