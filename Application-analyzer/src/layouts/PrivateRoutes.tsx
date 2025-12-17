import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function PrivateRoute() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to={"/login"} />
  }
  return (
    <Outlet />
  )
}