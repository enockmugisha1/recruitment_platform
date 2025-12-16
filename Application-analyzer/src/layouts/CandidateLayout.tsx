import pfp from "../assets/pfp.jpg"
import { Outlet, NavLink, useLocation } from "react-router-dom"

export default function CandidateLayout() {

  const curRoute = useLocation().pathname.split("/")
  const routes: { [key: string]: number[] } = {
    "": [20, 56],
    "evaluations": [20 + 120, 80],
    "experience": [20 + 120 + 150, 75],
    "education": [20 + 120 + 150 + 152, 75],
  }
  const routeKey = curRoute[3] || ""

  return (
    <div className="px-10 mt-3">
      <div className="w-full flex items-center text-sm">
        <p className="text-darkblue/50">Candidates</p>
        <p className="flex items-center gap-2 font-semibold">
          <i className="ml-1 fa-solid fa-chevron-right text-xl"></i>
          Pascal Onuoha
        </p>
        <p className="ml-auto flex items-center gap-2 font-semibold">
          <i className="fa-solid fa-arrow-left-long text-xl text-darkblue/50"></i>
          Go Back
        </p>
      </div>

      <div className="bg-lightgraybg px-8 py-3 flex justify-between items-center mt-2 rounded-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-16 aspect-square flex items-center justify-center rounded-full bg-darkblue/15 text-xl font-semibold text-darkblue/40">
              P O
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-12 items-center">
                <p className="font-semibold text-xl">Pascal Onuoha</p>
                <p className="px-9 py-1.5 leading-none bg-lightblue rounded-full font-semibold text-xs">Interview</p>
              </div>
              <p className="text-darkblue/50">pascalonuoha324@gmail.com <span className="ml-1">+2501234567</span></p>
            </div>
          </div>
          <div className="text-accentprimary flex items-center mt-4 px-3.5 gap-7">
            <a className="underline font-semibold" href="#">Edit</a>
            <a className="group" href="#">
              <i className="fa-brands fa-linkedin text-lg group-hover:scale-150 group-hover:text-textdark transition duration-200"></i>
            </a>
            <a className="group" href="#">
              <i className="fa-brands fa-twitter text-lg group-hover:scale-150 group-hover:text-textdark transition duration-200"></i>
            </a>
            <a className="group" href="#">
              <i className="fa-solid fa-globe text-lg group-hover:scale-150 group-hover:text-textdark transition duration-200"></i>
            </a>
          </div>
        </div>

        <div className="pl-16 pr-6 py-1 border-l-2 grid grid-cols-2 gap-y-2">
          <p className="col-span-2 font-semibold mb-1">Current Status</p>
          <p className="text-darkblue/50">Round</p>
          <p className="w-36 py-1.5 leading-none bg-lightblue rounded-xl font-semibold text-xs text-center">Final</p>
          <p className="text-darkblue/50">Assigned to</p>
          <p className="w-36 py-1.5 leading-none bg-lightblue rounded-xl font-semibold text-xs text-center relative">
            <img className="h-full aspect-square object-cover rounded-full absolute top-0 outline outline-4 outline-slate-300"
              src={pfp} alt="" />
            Alimany
          </p>
          <p className="text-darkblue/50">Interview Date</p>
          <p className="text-darkblue/50 font-semibold">Jul 30, 2021</p>
        </div>
      </div>

      <div className="mt-4 bg-lightgraybg rounded-lg">
        <div className="flex items-center gap-2 h-20 *:text-lg relative mx-4">
          <div style={{
            left: routes[routeKey][0] + "px",
            width: routes[routeKey][1] + "px"
          }} 
          className="h-0.5 rounded bg-accentsecondary absolute bottom-5 transition-all" />

          <NavLink end to="" className={({ isActive }) => "p-4 transition-all w-28 " + (isActive ? "font-semibold" : "text-textdark/50 hover:font-semibold")}>
            General
          </NavLink>
          <NavLink to="evaluations" className={({ isActive }) => "p-4 transition-all w-36 " + (isActive ? "font-semibold" : "text-textdark/50 hover:font-semibold")}>
            Evaluations
          </NavLink>
          <NavLink to="experience" className={({ isActive }) => "p-4 transition-all w-36 " + (isActive ? "font-semibold" : "text-textdark/50 hover:font-semibold")}>
            Experience
          </NavLink>
          <NavLink to="education" className={({ isActive }) => "p-4 transition-all w-36 " + (isActive ? "font-semibold" : "text-textdark/50 hover:font-semibold")}>
            Education
          </NavLink>
        </div>

        <div className="h-1 bg-graybg" />

        <div className="w-full mx-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}