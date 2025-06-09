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

type UserData = Pick<User, "id" | "username" | "firstName" | "lastName" | "email" | "isAdmin">;

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
        const res = await apiRequest("GET", "/api/auth/user");
        const data = await res.json();
        
        if (data.success && data.user) {
          return { user: data.user };
        } else {
          return { user: null };
        }
      } catch (err) {
        return { user: null };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Update the auth user data in the cache
      queryClient.setQueryData(["/api/auth/user"], { user: data.user });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
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
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Update the auth user data in the cache
      queryClient.setQueryData(["/api/auth/user"], { user: data.user });
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