import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchNotificationPreferences,
  updateNotificationPreferencesApi,
} from '../services/notificationsApi';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { socketService } from '../../realtime/services/socketService';
import { RealtimeEventName, type UserNotificationDto } from '@sehir-nabiz/shared';

export interface UseNotificationsOptions {
  unreadOnly?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const notificationsQueryKey = ['notifications', { unreadOnly: Boolean(options.unreadOnly) }];
  const unreadCountQueryKey = ['notifications', 'unread-count'];

  // Bildirimler Sorgusu
  const query = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: async () => {
      if (!accessToken) return { items: [], total: 0, unreadCount: 0 };
      return fetchNotifications({ unreadOnly: options.unreadOnly }, accessToken);
    },
    enabled: isAuthenticated && Boolean(accessToken),
    staleTime: 1000 * 30, // 30 saniye
  });

  // Okunmamış Sayısı Sorgusu
  const unreadCountQuery = useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: async () => {
      if (!accessToken) return 0;
      return fetchUnreadCount(accessToken);
    },
    enabled: isAuthenticated && Boolean(accessToken),
    staleTime: 1000 * 15,
  });

  // Canlı Bildirim Dinleyicisi (WebSocket)
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsub = socketService.on<UserNotificationDto>(
      RealtimeEventName.NOTIFICATION_NEW,
      () => {
        // Hem listeyi hem de sayaç sorgusunu tazele
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    );

    return unsub;
  }, [isAuthenticated, queryClient]);

  // Tekil Okundu İşaretleme
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw new Error('Oturum gerekli');
      return markNotificationAsRead(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Tümünü Okundu İşaretleme
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('Oturum gerekli');
      return markAllNotificationsAsRead(accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAsRead = useCallback(
    (id: string) => markReadMutation.mutateAsync(id),
    [markReadMutation],
  );

  const markAllAsRead = useCallback(
    () => markAllReadMutation.mutateAsync(),
    [markAllReadMutation],
  );

  return {
    notifications: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    unreadCount: unreadCountQuery.data ?? query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    markAsRead,
    markAllAsRead,
    isMarkingRead: markReadMutation.isPending || markAllReadMutation.isPending,
  };
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const queryKey = ['notifications', 'preferences'];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!accessToken) return null;
      return fetchNotificationPreferences(accessToken);
    },
    enabled: isAuthenticated && Boolean(accessToken),
    staleTime: 1000 * 60,
  });

  const updateMutation = useMutation({
    mutationFn: async (prefs: any) => {
      if (!accessToken) throw new Error('Oturum gerekli');
      return updateNotificationPreferencesApi(prefs, accessToken);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updatePreferences: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
