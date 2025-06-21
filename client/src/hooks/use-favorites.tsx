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
    mutationFn: (symbol: string) => 
      apiRequest('/api/user/favorites', 'POST', { symbol }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (symbol: string) => 
      apiRequest(`/api/user/favorites/${symbol}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    }
  });

  const toggleFavorite = (symbol: string) => {
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