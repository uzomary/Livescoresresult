
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Leagues", path: "/leagues" },
    { label: "News", path: "https://blog.livescoreresult.com", target: "_blank" },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant="ghost"
          className={`text-white px-4 py-2 ${location.pathname === item.path
              ? "bg-primary/20 text-primary"
              : ""
            }`}
          onClick={() => item.target === "_blank" ? window.open(item.path, '_blank') : navigate(item.path)}
        >

          {item.label}
        </Button>
      ))}
    </nav>
  );
};

export default DesktopNav;
