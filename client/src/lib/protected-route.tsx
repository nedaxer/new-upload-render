import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        )}
      </Route>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        {() => {
          // Use setTimeout to avoid immediate redirect
          setTimeout(() => {
            setLocation("/auth");
          }, 100);
          
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }}
      </Route>
    );
  }

  // User is authenticated, render the component
  return (
    <Route path={path}>
      {(params) => <Component {...params} />}
    </Route>
  );
}