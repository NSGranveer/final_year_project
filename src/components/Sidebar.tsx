
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Home, Bell, Video, Clock, Mail, ChevronLeft, ChevronRight, Flame } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      path: "/",
    },
    {
      title: "Realtime Alert",
      icon: Bell,
      path: "/realtime-alert",
    },
    {
      title: "Video Alert",
      icon: Video,
      path: "/video-alert",
    },
    {
      title: "Historical Logs",
      icon: Clock,
      path: "/historical-logs",
    },
    {
      title: "Contact Us",
      icon: Mail,
      path: "/contact",
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-sidebar h-screen transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center p-4 gap-2 h-16">
        <Flame className={cn("h-6 w-6 text-fire-600 animate-flame", collapsed ? "mx-auto" : "")} />
        {!collapsed && <h2 className="text-lg font-bold">Flame Guard</h2>}
      </div>

      <div className="flex flex-col gap-2 p-2 flex-1">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant={location.pathname === item.path ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                location.pathname === item.path ? "bg-primary text-primary-foreground" : "text-sidebar-foreground",
                collapsed ? "px-0 justify-center" : ""
              )}
            >
              <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-white" : "")} />
              {!collapsed && <span>{item.title}</span>}
            </Button>
          </Link>
        ))}
      </div>

      <Button
        variant="ghost"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent"
        onClick={toggleSidebar}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
