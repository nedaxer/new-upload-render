import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect, useLocation } from "wouter";

// This works with wouter's routing system by rendering the right component
// or redirecting based on auth state
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Create an inner component that will render inside the Route
  const ProtectedComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }
    
    if (!user) {
      return <Redirect to="/account/login" />;
    }
    
    return <Component />;
  };

  // Use wouter's Route component with the protected inner component
  return <Route path={path} component={ProtectedComponent} />;
}