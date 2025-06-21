import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['/api/user/favorites'],
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (symbol: string) => {
      try {
        return await apiRequest('/api/user/favorites', 'POST', { symbol });
      } catch (error) {
        console.error('Add favorite error:', error);
        return { success: false, error: 'Failed to add favorite' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    },
    onError: (error) => {
      console.error('Add favorite mutation error:', error);
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (symbol: string) => {
      try {
        return await apiRequest(`/api/user/favorites/${symbol}`, 'DELETE');
      } catch (error) {
        console.error('Remove favorite error:', error);
        return { success: false, error: 'Failed to remove favorite' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    },
    onError: (error) => {
      console.error('Remove favorite mutation error:', error);
    }
  });

  const toggleFavorite = (symbol: string) => {
    // Only toggle if user is authenticated
    if (!user) {
      console.log('User not authenticated, cannot toggle favorites');
      return;
    }
    
    if (favorites.includes(symbol)) {
      removeFavoriteMutation.mutate(symbol);
    } else {
      addFavoriteMutation.mutate(symbol);
    }
  };

  const isFavorite = (symbol: string) => {
    return favorites.includes(symbol);
  };

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    isUpdating: addFavoriteMutation.isPending || removeFavoriteMutation.isPending
  };
}