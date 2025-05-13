import React from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

type AuthRedirectProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

/**
 * Component that redirects authenticated users to the dashboard
 * and allows non-authenticated users to see the wrapped content
 */
export const AuthRedirect: React.FC<AuthRedirectProps> = ({ 
  children, 
  redirectTo = "/dashboard" 
}) => {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // If still loading auth status, show nothing (prevents flash)
  if (isLoading) {
    return null;
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Redirect to={redirectTo} />;
  }

  // Otherwise, show the wrapped content (login/register/etc)
  return <>{children}</>;
};