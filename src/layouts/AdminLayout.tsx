
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    FileText,
    LogOut,
    Menu,
    X,
    Plus,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
    const { isAuthenticated, user, isLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/admin/login");
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-[#ff0046] animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
        { label: "New Post", icon: Plus, path: "/admin/posts/new" },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-[#00141e] text-white w-64 flex-shrink-0 transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 md:relative",
                    !sidebarOpen && "-translate-x-full md:translate-x-0 md:w-20"
                )}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
                    <span className={cn("font-bold text-lg truncate", !sidebarOpen && "md:hidden")}>
                        Admin Panel
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                location.pathname === item.path
                                    ? "bg-[#ff0046] text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                            )}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span className={cn("truncate", !sidebarOpen && "md:hidden")}>
                                {item.label}
                            </span>
                        </Link>
                    ))}

                    <button
                        onClick={logout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800 mt-8",
                        )}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        <span className={cn("truncate", !sidebarOpen && "md:hidden")}>
                            Logout
                        </span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="ml-auto flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">{user?.email || "Admin User"}</span>
                        <div className="h-8 w-8 rounded-full bg-[#ff0046] flex items-center justify-center text-white font-bold text-xs uppercase">
                            {user?.email?.charAt(0) || "A"}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
