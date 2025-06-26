import React, { useMemo } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

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
  redirectTo = "/mobile" 
}) => {
  const { user, isLoading } = useAuth();

  // Skip loading screen to prevent duplicate splash
  if (isLoading) {
    return null;
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    console.log('User is authenticated, redirecting to:', redirectTo);
    return <Redirect to={redirectTo} />;
  }

  // Otherwise, show the wrapped content (login/register/etc)
  return <>{children}</>;
};