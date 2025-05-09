import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type QueryFnOptions = {
  on401?: "returnNull" | "throw";
};

// Default query function with error handling
export const getQueryFn = (options: QueryFnOptions = {}) => {
  return async (context: { queryKey: readonly (string | number)[] }) => {
    const [path] = context.queryKey;
    
    // Ensure path is a string
    const endpoint = typeof path === 'string' ? path : String(path);
    
    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        // Handle unauthorized error specially
        if (response.status === 401 && options.on401 === "returnNull") {
          return null;
        }
        
        // Get the error message from the response
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };
};

// Helper function for API requests (POST, PATCH, DELETE)
export async function apiRequest(method: string, url: string, data?: any) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for authentication
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  return fetch(url, options);
}