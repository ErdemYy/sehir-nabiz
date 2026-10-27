import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService, type RealtimeConnectionStatus } from '../services/socketService';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { RealtimeEventName } from '@sehir-nabiz/shared';
import type { BBoxCoordinates } from '../../map/types/map.types';

export interface UseRealtimeEventsOptions {
  bbox?: BBoxCoordinates | null;
  enabled?: boolean;
}

export interface UseRealtimeEventsResult {
  status: RealtimeConnectionStatus;
  isConnected: boolean;
  isSyncing: boolean;
  reconnect: () => void;
}

export function useRealtimeEvents({
  bbox,
  enabled = true,
}: UseRealtimeEventsOptions = {}): UseRealtimeEventsResult {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [status, setStatus] = useState<RealtimeConnectionStatus>(socketService.getStatus());
  const prevStatusRef = useRef<RealtimeConnectionStatus>(status);

  // Status dinleyicisi
  useEffect(() => {
    const unsub = socketService.onStatusChange((newStatus) => {
      setStatus(newStatus);

      // Reconnect / Syncing sonrasında REST snapshot senkronizasyonu (Reconciliation - Section 7)
      if (
        (prevStatusRef.current === 'reconnecting' || prevStatusRef.current === 'disconnected') &&
        newStatus === 'connected'
      ) {
        queryClient.invalidateQueries({ queryKey: ['events'] });
      }
      prevStatusRef.current = newStatus;
    });

    return unsub;
  }, [queryClient]);

  // Bağlantı başlatma
  useEffect(() => {
    if (!enabled) return;

    socketService.connect(accessToken);

    // Olay güncellemelerini dinle ve TanStack Query önbelleğini invalidate et
    const unsubCreated = socketService.on(RealtimeEventName.EVENT_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    });

    const unsubUpdated = socketService.on(RealtimeEventName.EVENT_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    });

    const unsubStatus = socketService.on(RealtimeEventName.EVENT_STATUS_CHANGED, () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    });

    const unsubFeedback = socketService.on(RealtimeEventName.EVENT_FEEDBACK_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubStatus();
      unsubFeedback();
    };
  }, [enabled, accessToken, queryClient]);

  // BBox değiştiğinde odaya abone ol
  useEffect(() => {
    if (enabled && bbox) {
      socketService.subscribeBbox(bbox);
    }
  }, [enabled, bbox]);

  const reconnect = useCallback(() => {
    socketService.connect(accessToken);
  }, [accessToken]);

  return {
    status,
    isConnected: status === 'connected',
    isSyncing: status === 'syncing',
    reconnect,
  };
}
