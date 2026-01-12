import { NavLink } from "react-router-dom";

interface JobSeekerSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function JobSeekerSidebar({ isOpen, onClose }: JobSeekerSidebarProps) {
    const navItems = [
        { path: "/dashboard", icon: "fa-solid fa-home", label: "Dashboard" },
        { path: "/browse-jobs", icon: "fa-solid fa-search", label: "Browse Jobs" },
        { path: "/my-applications", icon: "fa-solid fa-file-alt", label: "My Applications" },
        { path: "/profile", icon: "fa-solid fa-user", label: "Profile" },
    ];

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-40 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    } ${!isOpen ? "lg:-translate-x-full" : ""}`}
            >
                {/* Navigation */}
                <nav className="flex flex-col h-full py-4">
                    {/* Main Navigation */}
                    <div className="flex-1 px-3 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <i
                                            className={`${item.icon} w-5 text-center transition-colors ${isActive ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700"
                                                }`}
                                        ></i>
                                        <span className="flex-1">{item.label}</span>
                                        {isActive && (
                                            <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="px-3 pt-4 border-t border-gray-200 space-y-1">
                        <NavLink
                            to="/saved-jobs"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <i
                                        className={`fa-solid fa-bookmark w-5 text-center transition-colors ${isActive ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700"
                                            }`}
                                    ></i>
                                    <span className="flex-1">Saved Jobs</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink
                            to="/settings"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <i
                                        className={`fa-solid fa-cog w-5 text-center transition-colors ${isActive ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700"
                                            }`}
                                    ></i>
                                    <span className="flex-1">Settings</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink
                            to="/help"
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-700 hover:bg-gray-100"
                        >
                            <i className="fa-solid fa-question-circle w-5 text-center text-gray-500 group-hover:text-gray-700 transition-colors"></i>
                            <span className="flex-1">Help & Support</span>
                        </NavLink>
                    </div>
                </nav>
            </aside>
        </>
    );
}
