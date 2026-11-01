import { Link, Outlet, useNavigate } from "react-router-dom";
import { useRoleGuard } from "../../hooks/useRoleGuard";
import { clearSession } from "../../utils/auth";

/** Shell for the business portal. Only `business` accounts get past the guard. */
export default function BusinessLayout() {
  const navigate = useNavigate();
  const { status, user } = useRoleGuard("business");

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <i className="fa-solid fa-spinner loading-spinner text-2xl text-green-600"></i>
      </div>
    );
  }

  const logout = () => {
    clearSession();
    navigate("/business/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/business" className="flex items-center gap-2 text-xl font-bold text-green-600">
            <i className="fa-solid fa-leaf"></i>
            <span>ThinkGreen Afrika</span>
            <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-green-700">
              Business
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-gray-600 sm:block">{user?.email}</span>
            <Link to="/change-password" className="text-gray-500 hover:text-gray-800">Password</Link>
            <button onClick={logout} className="font-semibold text-red-600 hover:text-red-700">
              <i className="fa-solid fa-right-from-bracket mr-1"></i>Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
