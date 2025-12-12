import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import WorkflowPage from "@/pages/WorkflowPage";
import DocumentationPage from "@/pages/DocumentationPage";
import LoginPage from "@/pages/LoginPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WorkflowPage} />
      <Route path="/docs" component={DocumentationPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on app load
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    // If we get user data, we're authenticated
    // If we get an error and it's not loading, we're not authenticated
    if (!isLoading) {
      setIsAuthenticated(!!user);
    }
  }, [user, isLoading]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    refetch(); // Refetch user data after successful login
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main app if authenticated
  return <Router />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AuthenticatedApp />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
