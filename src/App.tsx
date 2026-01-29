import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CourseProvider } from "./contexts/CourseContext";
import { DemoModeProvider } from "./contexts/DemoModeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorFallback } from "./components/ErrorFallback";
import { DemoIntroModal } from "./components/demo/DemoIntroModal";
import { DemoCompleteModal } from "./components/demo/DemoCompleteModal";
import { DemoGuidancePanel } from "./components/demo/DemoGuidancePanel";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateCourse from "./pages/CreateCourse";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CourseProvider>
        <DemoModeProvider>
          <ErrorBoundary
            fallback={({ error, resetError }) => (
              <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <ErrorFallback
                  error={error}
                  resetError={resetError}
                  title="Application Error"
                  description="Something went wrong with the application. Please refresh the page or try again."
                  showReportLink
                />
              </div>
            )}
          >
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create" element={<CreateCourse />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            {/* Demo Mode UI Components */}
            <DemoIntroModal />
            <DemoCompleteModal />
            <DemoGuidancePanel />
          </ErrorBoundary>
        </DemoModeProvider>
      </CourseProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
