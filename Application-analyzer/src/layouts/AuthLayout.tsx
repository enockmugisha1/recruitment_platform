import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom"
import foldersImg from "../assets/appfolders.png"
import { useEffect, useState } from "react";

export default function AuthLayout() {
  const location = useLocation().pathname;
  const undCls = location === "/login" ? "left-0 w-10" : "w-24 left-20"

  const [slideOut, setSlideOut] = useState(false)
  const [slideIn, setSlideIn] = useState(false)
  const navigate = useNavigate()


  function handleAuth() {
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
      <div className={"bg-bggray pt-28 w-[750px] p-16 signshadow flex items-end mx-auto mt-12" + (slideOut ? " slideout" : "") + (slideIn ? " slidein" : "")}>
        <div className="flex w-full mt-auto">
          <div className="w-[40%] relative border-r-2 border-lines">
            <img className="w-full absolute -translate-y-1/2 top-1/2 pr-11"
              src={foldersImg} alt="banner" />
          </div>
          <div className="w-[60%] px-11">
            <div className="flex items-center h-16 *:transition-all duration-1000 relative">
              <NavLink className={({ isActive }) => (isActive ? "text-4xl font-semibold text-accentprimary undline" : "text-xl text-accentprimary/50") + " pr-3"}
                to="/login">Login</NavLink>
              <div className="border-l-2 h-3/4 border-lines" />
              <NavLink className={({ isActive }) => (isActive ? "text-4xl font-semibold text-accentprimary undline" : "text-xl text-accentprimary/50") + " pl-3"}
                to="/signup">Sign Up</NavLink>
              <div className={"absolute bottom-0 h-1 bg-accentsecondary rounded " + undCls}></div>
            </div>

            <Outlet context={[handleAuth]} />
          </div>
        </div>
      </div>

      <div className={"text-accentprimary mt-8 mb-4 text-center text-sm space-y-1" + (slideOut ? " invisible" : "") + (slideIn ? " invisible" : "")}>
        <p className="underline font-semibold">Release Notes</p>
        <p>version 20.22.11</p>
        <p>Copyright © 2025 <span className="ml-1">ThinkGreen Afrika</span></p>
      </div>
    </>
  )
}