import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Gift, User } from "lucide-react";

const tabs = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Défi" },
  { path: "/rewards", icon: Gift, label: "Rewards" },
  { path: "/profile", icon: User, label: "Profil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-glass border-t border-border px-6 py-2 z-40">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${active ? "drop-shadow-[0_0_8px_hsl(110,100%,55%,0.5)]" : ""}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
