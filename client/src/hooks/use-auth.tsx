import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type LoginData = {
  username: string;
  password: string;
};

type UserData = Pick<User, "id" | "username" | "firstName" | "lastName" | "email" | "isAdmin" | "profilePicture">;

type AuthContextType = {
  user: UserData | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ success: boolean; user: UserData }, Error, LoginData>;
  logoutMutation: UseMutationResult<{ success: boolean }, Error, void>;
  registerMutation: UseMutationResult<{ success: boolean; user: UserData }, Error, InsertUser>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch the authenticated user
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        // Check if the response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.log('Auth query: Non-JSON response received');
          return { user: null };
        }
        
        const data = await res.json();
        console.log('Auth query response:', data);
        
        if (data.success && data.user) {
          return { user: data.user };
        } else {
          return { user: null };
        }
      } catch (err) {
        console.log('Auth query error:', err);
        return { user: null };
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error) => {
      // Only retry if it's a network error, not auth errors
      return failureCount < 2 && error?.message !== 'Not authenticated';
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("/api/auth/login", "POST", credentials);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Login successful, updating cache with user:', data.user);
      // Update the auth user data in the cache immediately
      queryClient.setQueryData(["/api/auth/user"], { user: data.user });
      // Force immediate cache invalidation and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/auth/logout", "POST");
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      // Clear the auth user data from the cache
      queryClient.setQueryData(["/api/auth/user"], { user: null });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("/api/auth/register", "POST", userData);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Registration successful, updating cache with user:', data.user);
      // Update the auth user data in the cache
      queryClient.setQueryData(["/api/auth/user"], { user: data.user });
      // Also invalidate to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: authData?.user || null,
        isLoading,
        error: error as Error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}