import { useNavigate, Outlet, Link } from "react-router-dom";
import pfpImg from "../assets/pfp.png";
import { useEffect, useState } from "react";
import JobSeekerSidebar from "../components/JobSeekerSidebar";
import { jwtDecode } from "jwt-decode";

export default function JobSeekerLayout() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [email, setEmail] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken");
    const mail = localStorage.getItem("email");
    const userDataStr = localStorage.getItem("user");

    useEffect(() => {
        if (mail) {
            setEmail(mail);
        }
        if (token) {
            const decoded: any = jwtDecode(token);
            console.log(decoded);
        }

        // Check authentication
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        // Check role - only job seekers can access job seeker layout
        if (userDataStr && userDataStr !== "undefined") {
            try {
                const userData = JSON.parse(userDataStr);
                if (userData && userData.role !== "job_seeker") {
                    navigate("/", { replace: true });
                }
            } catch (e) {
                console.error("Error parsing user data:", e);
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
            }
        }
    }, [token, userDataStr, navigate]);

    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        const fromAuthData = localStorage.getItem("from");
        const from = fromAuthData;

        if (from === "auth") {
            setAnimate(true);
            setTimeout(() => setAnimate(false), 1000);
        }

        localStorage.setItem("from", "null");
    }, []);

    const [fadeOut, setFadeOut] = useState(false);
    function handleLogout() {
        setFadeOut(true);
        localStorage.setItem("from", "logout");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("email");

        setTimeout(() => navigate("/login"), 1000);
    }

    // Mock notifications for job seekers
    const notifications = [
        { id: 1, title: "Application Status Update", message: "Your application for Senior Developer has been shortlisted", time: "10m ago", unread: true },
        { id: 2, title: "New Job Match", message: "5 new jobs match your profile", time: "2h ago", unread: true },
        { id: 3, title: "Interview Reminder", message: "Interview with TechCorp tomorrow at 10 AM", time: "5h ago", unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Overlay for animations */}
            <div className={"fixed inset-0 pointer-events-none z-50 " + (animate ? "fadein" : "") + (fadeOut ? "fadeout" : "")}></div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 shadow-sm">
                <div className="flex items-center justify-between h-full px-4 lg:px-6">
                    {/* Left: Logo + Hamburger + Search */}
                    <div className="flex items-center gap-4 flex-1">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <i className="fa-solid fa-bars text-gray-600 text-lg"></i>
                        </button>

                        {/* Desktop Sidebar Toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <i className="fa-solid fa-bars text-gray-600 text-lg"></i>
                        </button>

                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-emerald-600">
                            <i className="fa-solid fa-briefcase"></i>
                            <span className="hidden sm:block">JobSeeker</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:flex items-center flex-1 max-w-lg">
                            <div className="relative w-full">
                                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Notifications + Profile */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowProfileMenu(false);
                                }}
                                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <i className="fa-solid fa-bell text-gray-600 text-lg"></i>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Mark all read</button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${notification.unread ? "bg-emerald-50" : ""
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                                    </div>
                                                    {notification.unread && (
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-gray-200">
                                        <button className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowProfileMenu(!showProfileMenu);
                                    setShowNotifications(false);
                                }}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <img src={pfpImg} alt="Profile" className="w-8 h-8 rounded-full border-2 border-gray-200" />
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-gray-700">{email || "Job Seeker"}</p>
                                    <p className="text-xs text-gray-500">Job Seeker</p>
                                </div>
                                <i className={`fa-solid fa-chevron-${showProfileMenu ? "up" : "down"} text-gray-400 text-xs`}></i>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                    <div className="p-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-800">{email || "Job Seeker"}</p>
                                        <p className="text-xs text-gray-500">Job Seeker Account</p>
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
                                        <Link
                                            to="/settings"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <i className="fa-solid fa-cog w-4"></i>
                                            <span>Settings</span>
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

            {/* Sidebar */}
            <JobSeekerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
                ></div>
            )}

            {/* Main Content */}
            <main
                className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-0"
                    }`}
                onClick={() => {
                    if (showProfileMenu) setShowProfileMenu(false);
                    if (showNotifications) setShowNotifications(false);
                }}
            >
                <div className="p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
