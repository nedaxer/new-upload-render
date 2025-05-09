import React from "react";
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

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#0033a0]" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/account/login" />
      </Route>
    );
  }

  // Additional check for admin routes
  if (adminOnly && !user.isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/dashboard" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
};