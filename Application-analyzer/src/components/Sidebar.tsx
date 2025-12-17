import { NavLink, useLocation } from 'react-router-dom'
import sidehome from "../assets/sidehome.svg"
import sidejobs from "../assets/sidejobs.svg"
import sidecand from "../assets/sidecand.svg"
import sidecal from "../assets/sidecal.svg"

export default function Sidebar() {
    const activeCls = " glow"
    const inactCls = " opacity-40 hover:opacity-100 transition duration-200"
    const routes = {
        "": 0,
        "jobs": 1,
        "candidates": 2,
        "calendar": 3,
        // "reports": 3,
    }
    const curRoute = useLocation().pathname.split("/")[1] as keyof typeof routes



    const trkbar = { top: 145 + 75 * routes[curRoute] }
    return (
        <nav className="fixed top-0 bottom-0 left-0 flex flex-col items-center gap-5 pt-40 rounded-r-lg w-28 bg-accentprimary text-sm">
            <div style={trkbar}
                className={"absolute w-2 h-20 bg-accentsecondary left-0 rounded-r-lg transition-all"}></div>
            <NavLink className={({ isActive }) => "relative bg-transparent transition" + (isActive ? activeCls : inactCls)}
                to="/">
                <img className="mx-auto"
                    src={sidehome} alt="home icon" />
                <p className="mt-1 font-semibold text-white">Home</p>
            </NavLink>
            <NavLink className={({ isActive }) => "relative bg-transparent transition" + (isActive ? activeCls : inactCls)}
                to="/jobs">
                <img className="mx-auto"
                    src={sidejobs} alt="home icon" />
                <p className="mt-1 font-semibold text-white">Jobs</p>
            </NavLink>
            <NavLink className={({ isActive }) => "relative bg-transparent transition" + (isActive ? activeCls : inactCls)}
                to="/candidates">
                <img className="mx-auto"
                    src={sidecand} alt="home icon" />
                <p className="mt-1 font-semibold text-white">Candidates</p>
            </NavLink>
            {/* <NavLink className={({ isActive }) => "relative bg-transparent transition" + (isActive ? activeCls : inactCls)}
                to="/reports">
                <img className="mx-auto"
                    src={sidereports} alt="home icon" />
                <p className="mt-1 font-semibold text-white">Reports</p>
            </NavLink> */}
            <NavLink className={({ isActive }) => "relative bg-transparent transition" + (isActive ? activeCls : inactCls)}
                to="/calendar">
                <img className="mx-auto"
                    src={sidecal} alt="home icon" />
                <p className="mt-1 font-semibold text-white">Calendar</p>
            </NavLink>
        </nav>
    )
}
