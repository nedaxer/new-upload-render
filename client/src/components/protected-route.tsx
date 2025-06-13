import React, { useMemo } from "react";
import { Redirect, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import type { RouteComponentProps } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<RouteComponentProps<{ [param: string]: string | undefined }>>;
  adminOnly?: boolean;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  path,
  component: Component,
  adminOnly = false,
}) => {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute check:', { user, isLoading, adminOnly, path });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Redirect to="/account/login" />;
  }

  if (adminOnly && !user.isAdmin) {
    console.log('User is not admin, redirecting to mobile');
    return <Redirect to="/mobile" />;
  }

  console.log('User authenticated, rendering component');

  // Memoize loading component to prevent re-renders
  const loadingComponent = useMemo(() => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0033a0] mx-auto mb-4" />
        <p className="text-gray-600">Verifying access...</p>
      </div>
    </div>
  ), []);

  return (
    <Route path={path}>
      {(routeParams) => {
        if (isLoading) {
          return loadingComponent;
        }

        if (!user) {
          return <Redirect to="/account/login" />;
        }

        // Additional check for admin routes
        if (adminOnly && !user.isAdmin) {
          return <Redirect to="/mobile" />;
        }

        return <Component {...(routeParams || {})} />;
      }}
    </Route>
  );
};