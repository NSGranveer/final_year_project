
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/hooks/use-theme";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-col w-full overflow-auto">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
