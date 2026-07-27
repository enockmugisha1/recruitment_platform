import { useNavigate, Outlet, Link } from "react-router-dom";
import pfpImg from "../assets/pfp.png";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import JobSeekerSidebar from "../components/JobSeekerSidebar";
import { getCurrentUser, clearSession, CurrentUser } from "../utils/auth";

/**
 * Used for routes that both recruiters and job seekers can reach
 * (e.g. /settings, /help). Unlike AdminLayout/JobSeekerLayout, this
 * layout does NOT redirect based on role — it just picks the right
 * sidebar/branding for whichever role is logged in.
 */
export default function SharedLayout() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const current = getCurrentUser();
        if (!current) {
            navigate("/login", { replace: true });
            return;
        }
        setUser(current);
        setChecking(false);
    }, [navigate]);

    function handleLogout() {
        clearSession();
        navigate("/login", { replace: true });
    }

    if (checking || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <i className="fa-solid fa-spinner loading-spinner text-2xl text-green-600"></i>
            </div>
        );
    }

    const isRecruiter = user.role === "recruiter";
    const accent = isRecruiter ? "green" : "emerald";
    const homePath = isRecruiter ? "/" : "/dashboard";
    const brandIcon = isRecruiter ? "fa-users-gear" : "fa-briefcase";
    const brandLabel = isRecruiter ? "RecruiterPro" : "JobSeeker";
    const roleLabel = isRecruiter ? "Recruiter" : "Job Seeker";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 shadow-sm">
                <div className="flex items-center justify-between h-full px-4 lg:px-6">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <i className="fa-solid fa-bars text-gray-600 text-lg"></i>
                        </button>

                        <Link to={homePath} className={`flex items-center gap-2 font-bold text-xl text-${accent}-600`}>
                            <i className={`fa-solid ${brandIcon}`}></i>
                            <span className="hidden sm:block">{brandLabel}</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <img src={pfpImg} alt="Profile" className="w-8 h-8 rounded-full border-2 border-gray-200" />
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-gray-700">{user.email || roleLabel}</p>
                                    <p className="text-xs text-gray-500">{roleLabel}</p>
                                </div>
                                <i className={`fa-solid fa-chevron-${showProfileMenu ? "up" : "down"} text-gray-400 text-xs`}></i>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                    <div className="p-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-800">{user.email || roleLabel}</p>
                                        <p className="text-xs text-gray-500">{roleLabel} Account</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <i className="fa-solid fa-user w-4"></i>
                                            <span>My Profile</span>
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-200 py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <i className="fa-solid fa-sign-out-alt w-4"></i>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar — pick the one matching the logged-in role */}
            {isRecruiter ? (
                <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            ) : (
                <JobSeekerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}

            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
                ></div>
            )}

            <main
                className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}
                onClick={() => {
                    if (showProfileMenu) setShowProfileMenu(false);
                }}
            >
                <div className="p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
