
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";

// Pages
import Home from "@/pages/home/Home";
import RealtimeAlert from "@/pages/realtime-alert/RealtimeAlert";
import VideoAlert from "@/pages/video-alert/VideoAlert";
import HistoricalLogs from "@/pages/historical-logs/HistoricalLogs";
import Contact from "@/pages/contact/Contact";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/realtime-alert" element={<RealtimeAlert />} />
            <Route path="/video-alert" element={<VideoAlert />} />
            <Route path="/historical-logs" element={<HistoricalLogs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
