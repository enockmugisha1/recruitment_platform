import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthProvider";

export default function PrivateRoute() {
  const {user, setAuthTokens} = useContext(AuthContext)
  if (!user) {
    return <Navigate to={"/login"} />
  }
  return (
    <Outlet />
  )
}