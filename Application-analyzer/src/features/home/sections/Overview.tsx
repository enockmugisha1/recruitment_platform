import ov1 from "../assets/ov1.svg"
import ov2 from "../assets/ov2.svg"
import ov3 from "../assets/ov3.svg"
import ov4 from "../assets/ov4.svg"
import ov5 from "../assets/ov5.svg"
import ov6 from "../assets/ov6.svg"
import ov7 from "../assets/ov7.svg"
import ov8 from "../assets/ov8.svg"
import { useNavigate } from "react-router-dom"

export default function Overview() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between">
        <h2 className="font-semibold text-xl indent-6">Overview</h2>
        <button 
          onClick={() => navigate('/jobs/create')}
          className="px-4 py-2 bg-accentprimary text-white rounded-lg flex gap-2 hover:bg-darkblue transition group"
        >
          <span className="border-2 w-6 aspect-square rounded-full flex items-center justify-center">
            <i className="fa-solid fa-plus leading-3 block"></i>
          </span>
          Add Job
        </button>
      </div>
      <div className="grid grid-cols-4 mt-5 gap-x-4 gap-y-10">
        <a className="myovelement group"
          href="#">
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">33</span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov1} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Interview <br /> Scheduled
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </a>

        <a className="myovelement group"
          href="#">
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              2
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov2} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Interview Feedback <br /> Pending
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </a>


        <a className="myovelement group"
          href="#">
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              44
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov3} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Approval <br /> Pending
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </a>

        <a className="myovelement group"
          href="#">
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              13
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov4} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Offer Acceptance <br /> Pending
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </a>

        <a className="myovelement group"
          href="#">
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              17
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov5} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Documentations <br /> Pending
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </a>

        <a className="myovelement group"
          href="/jbs">
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              107
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov6} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Total <br /> Candidates
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </a>

        <a className="myovelement group"
          href="#">
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              5
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov7} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Supervisor Allocation <br /> Pending
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </a>

        <a className="myovelement group"
          href="#">
          <div className="mynumwindow">
            <span className="font-semibold text-2xl group-hover:text-4xl group-hover:text-white transition-all">
              56
            </span>
          </div>

          <img className="ml-auto w-24 mt-5" src={ov8} alt="" />
          <p className="text-sm text-textdark/50 group-hover:translate-y-4 group-hover:font-semibold group-hover:text-textdark transition-all duration-300">
            Project Allocation <br /> Pending
          </p>

          <i className="fa-solid fa-chevron-right absolute bottom-3 right-16 text-xl opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all duration-300"></i>
          <i className="fa-solid fa-angle-right absolute bottom-3 right-16 text-lg opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300"></i>
        </a>
      </div>
    </>
  )
}