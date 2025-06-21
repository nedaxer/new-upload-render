import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';

export function usePreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/user/preferences'],
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: any) => {
      try {
        return await apiRequest('/api/user/preferences', 'PUT', updates);
      } catch (error) {
        console.error('Preferences update error:', error);
        // Return a default response to prevent hanging
        return { success: false, error: 'Failed to update preferences' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
    },
    onError: (error) => {
      console.error('Preferences mutation error:', error);
    }
  });

  const updateLastSelectedPair = (pair: string) => {
    // Only update if user is authenticated
    if (user) {
      updatePreferencesMutation.mutate({ lastSelectedPair: pair });
    }
  };

  const updatePreference = (key: string, value: any) => {
    // Only update if user is authenticated
    if (user) {
      updatePreferencesMutation.mutate({ [key]: value });
    }
  };

  const getLastSelectedPair = () => {
    return preferences?.lastSelectedPair || 'BTCUSDT';
  };

  return {
    preferences,
    isLoading,
    updateLastSelectedPair,
    updatePreference,
    getLastSelectedPair,
    isUpdating: updatePreferencesMutation.isPending
  };
}