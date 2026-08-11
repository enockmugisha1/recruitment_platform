import { NavLink } from "react-router-dom";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const navItems = [
        { path: "/", icon: "fa-solid fa-house", label: "Overview" },
        { path: "/candidates", icon: "fa-solid fa-users", label: "Candidates" },
        { path: "/jobs", icon: "fa-solid fa-briefcase", label: "Jobs" },
        { path: "/calendar", icon: "fa-solid fa-calendar", label: "Calendar" },
        { path: "/reports", icon: "fa-solid fa-chart-line", label: "Reports" },
    ];

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-40 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Navigation */}
                <nav className="flex flex-col h-full py-4">
                    {/* Main Navigation */}
                    <div className="flex-1 px-3 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? "bg-green-50 text-green-700 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <i
                                            className={`${item.icon} w-5 text-center transition-colors ${isActive ? "text-green-600" : "text-gray-500 group-hover:text-gray-700"
                                                }`}
                                        ></i>
                                        <span className="flex-1">{item.label}</span>
                                        {isActive && (
                                            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="px-3 pt-4 border-t border-gray-200 space-y-1">
                        <NavLink
                            to="/settings"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? "bg-green-50 text-green-700 font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <i
                                        className={`fa-solid fa-cog w-5 text-center transition-colors ${isActive ? "text-green-600" : "text-gray-500 group-hover:text-gray-700"
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
