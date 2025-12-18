import { useNavigate, NavLink, Outlet, useLocation, Link } from "react-router-dom"
import pfpImg from "../assets/pfp.png"
import { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import CandGeneral from "../features/candidates/pages/CandGeneral"
import { jwtDecode } from "jwt-decode";


export default function Layout() {
  
  const [showWind, setShowWind] = useState(false)
  const [ email, setEmail ] = useState(undefined)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  const token = localStorage.getItem("accessToken")
  const mail = localStorage.getItem("email")
  
  useEffect(() => {
    if(mail){
      setEmail(mail)
    }
    if (token) {
      const decoded: any = jwtDecode(token)
      console.log(decoded)
      setUser(decoded)
    }
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token])

  function handleShowWind() {
    setShowWind(prev => !prev)
  }

  
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    const fromAuthData = localStorage.getItem("from");
    const from = fromAuthData;
    
    if (from === "auth") {
      setAnimate(true)
      setTimeout(() => setAnimate(false), 1000)
    }

    

    localStorage.setItem("from", "null")
  }, [])

  const [fadeOut, setFadeOut] = useState(false)
  function handleLogout() {
    setFadeOut(true)
    localStorage.setItem("from", "logout")

    
    setTimeout(() => navigate("login"), 1000)
  }

  return (
    <>
      <div className={"fixed " + (animate ? "fadein" : "") + (fadeOut ? "fadeout" : "")}></div>
      <header className="flex items-center justify-between w-full h-20 pr-10 bg-white pl-36 shadow-lg shadow-[#5B5B5B21]">
        <div className="h-10 overflow-hidden border rounded-lg bg-graybg/50 border-darkblue/25 w-96">
          <input className="relative z-10 w-full h-full pl-10 bg-transparent border-transparent placeholder:text-darkblue/50 placeholder:text-sm"
            type="text" placeholder="Search" />
          <i className="relative block fa-solid fa-magnifying-glass text-darkblue/25 -top-6 left-3"></i>

        </div>
        <div className="relative">
          <button onClick={handleShowWind} className="flex items-center h-9">
            <img className="h-full"
              src={pfpImg} alt="profile picture" />
            <span className="ml-2.5 font-semibold text-sm">{ email}</span>
            <i className={`ml-1 fa-solid fa-chevron-${showWind ? "up" : "down"} text-darkblue/50`}></i>
          </button>
          {showWind && (
            <div className="absolute w-fit right-0 px-3 prfwindow flex flex-col bg-[#F3F8FF] ml-9 mt-1 rounded border border-[#AEB8CC] p-1">
              <Link to={'/profile'} className="text-end py-0.5 pt-1 hover:bg-graybg rounded-lg flex items-center justify-end group transition-colors">Profile
                <div className="h-3 w-px rounded bg-transparent group-hover:bg-darkblue/50 ml-2 transition-colors" />
              </Link>
              <button onClick={handleLogout} className="text-end py-0.5 pt-1 hover:bg-graybg rounded-lg flex items-center justify-end group transition-colors">Logout
                <div className="h-3 w-px rounded bg-transparent group-hover:bg-darkblue/50 ml-2 transition-colors" />
              </button>
            </div>
          )}
        </div>
      </header>
      <Sidebar />
      
      <div onClick={() => showWind && setShowWind(false)} className="ml-28 pb-5">
        <Outlet />
      </div>
    </>
  )
}