import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom"
import foldersImg from "../assets/appfolders.png"
import { FormEvent, useEffect, useState } from "react";

export default function AuthLayout() {
  const location = useLocation().pathname;
  const undCls = location === "/login" ? "left-0 w-10" : "w-24 left-20"

  const [slideOut, setSlideOut] = useState(false)
  const [slideIn, setSlideIn] = useState(false)
  const navigate = useNavigate()


  function handleAuth(e: FormEvent) {
    e.preventDefault()
    // const frm = e.target as HTMLFormElement
    localStorage.setItem("from", "auth")

    setSlideOut(true)
    document.body.style.overflowY = "hidden"
    setTimeout(() => {
      document.body.style.overflowY = "auto"
      navigate('/')
    }, 700)
  }

  useEffect(() => {
    if (localStorage.getItem("from") === "logout") {
      setSlideIn(true)
      document.body.style.overflowY = "hidden"
      setTimeout(() => {
        setSlideIn(false)
        document.body.style.overflowY = "auto"
      }, 700)
      // setTimeout(() => setSlideIn(false), 700)
    }

    localStorage.setItem("from", "null")
  }, [])

  return (
    <>
      <div className={"bg-bggray pt-16 sm:pt-20 md:pt-28 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[750px] p-4 sm:p-8 md:p-16 signshadow flex items-end mx-auto mt-4 sm:mt-8 md:mt-12" + (slideOut ? " slideout" : "") + (slideIn ? " slidein" : "")}>
        <div className="flex flex-col md:flex-row w-full mt-auto">
          <div className="hidden md:block w-full md:w-[40%] relative border-r-0 md:border-r-2 border-lines mb-4 md:mb-0">
            <img className="w-full md:absolute md:-translate-y-1/2 md:top-1/2 pr-0 md:pr-11"
              src={foldersImg} alt="banner" />
          </div>
          <div className="w-full md:w-[60%] px-0 md:px-11">
            <div className="flex items-center h-12 sm:h-14 md:h-16 *:transition-all duration-1000 relative">
              <NavLink className={({ isActive }) => (isActive ? "text-2xl sm:text-3xl md:text-4xl font-semibold text-accentprimary undline" : "text-lg sm:text-xl text-accentprimary/50") + " pr-2 sm:pr-3"}
                to="/login">Login</NavLink>
              <div className="border-l-2 h-3/4 border-lines" />
              <NavLink className={({ isActive }) => (isActive ? "text-2xl sm:text-3xl md:text-4xl font-semibold text-accentprimary undline" : "text-lg sm:text-xl text-accentprimary/50") + " pl-2 sm:pl-3"}
                to="/signup">Sign Up</NavLink>
              <div className={"absolute bottom-0 h-1 bg-accentsecondary rounded " + undCls}></div>
            </div>

            <Outlet context={[handleAuth]} />
          </div>
        </div>
      </div>

      <div className={"text-accentprimary mt-4 sm:mt-6 md:mt-8 mb-4 text-center text-xs sm:text-sm space-y-1 px-4" + (slideOut ? " invisible" : "") + (slideIn ? " invisible" : "")}>
        <p className="underline font-semibold">Release Notes</p>
        <p>version 20.22.11</p>
        <p>Copyright © 2025 <span className="ml-1">ThinkGreen Afrika</span></p>
      </div>
    </>
  )
}