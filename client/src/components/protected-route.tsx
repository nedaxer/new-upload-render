import { useEffect } from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '../lib/auth';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      setLocation('/auth');
    }
  }, [user, isLoading, setLocation]);

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}