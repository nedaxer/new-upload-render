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
    mutationFn: (updates: any) => 
      apiRequest('/api/user/preferences', 'PUT', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
    }
  });

  const updateLastSelectedPair = (pair: string) => {
    updatePreferencesMutation.mutate({ lastSelectedPair: pair });
  };

  const updatePreference = (key: string, value: any) => {
    updatePreferencesMutation.mutate({ [key]: value });
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