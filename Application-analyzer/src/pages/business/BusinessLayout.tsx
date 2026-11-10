import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/business" className="flex items-center gap-2 text-xl font-bold text-green-600">
            <i className="fa-solid fa-leaf"></i>
            <span>ThinkGreen Afrika</span>
            <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-green-700">
              Business
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { to: "/business", label: "Dashboard", icon: "fa-chart-line", end: true },
              { to: "/business/companies", label: "Companies", icon: "fa-building", end: false },
              { to: "/business/recruiters", label: "Recruiters", icon: "fa-user-tie", end: false },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}>
                <i className={`fa-solid ${item.icon} mr-2`}></i>{item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-gray-600 sm:block">{user?.email}</span>
            <Link to="/change-password" className="text-gray-500 hover:text-gray-800">Password</Link>
            <button onClick={logout} className="font-semibold text-red-600 hover:text-red-700">
              <i className="fa-solid fa-right-from-bracket mr-1"></i>Logout
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-3 py-2 md:hidden">
          {[["/business", "Dashboard", true], ["/business/companies", "Companies", false], ["/business/recruiters", "Recruiters", false]].map(([to, label, end]) => (
            <NavLink key={to as string} to={to as string} end={end as boolean}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${isActive ? "bg-green-50 text-green-700" : "text-gray-600"}`}>
              {label as string}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
