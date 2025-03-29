
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;

  // Map route to title
  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard";
      case "/realtime-alert":
        return "Realtime Alert";
      case "/video-alert":
        return "Video Alert";
      case "/historical-logs":
        return "Historical Logs";
      case "/contact":
        return "Contact Us";
      default:
        return "Flame Guard";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold md:text-xl">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-fire-600 animate-pulse-fire"></span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
