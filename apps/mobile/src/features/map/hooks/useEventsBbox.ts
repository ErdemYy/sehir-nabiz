import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { EventResponseDto } from '@sehir-nabiz/shared';
import type { BBoxCoordinates, EventGeoJsonCollection } from '../types/map.types';
import { fetchEventsBbox } from '../services/eventsApi';
import { convertEventsToGeoJson, validateBBox } from '../utils/geoUtils';

export interface UseEventsBboxOptions {
  bbox: BBoxCoordinates | null;
  category?: string | null;
  searchQuery?: string;
  enabled?: boolean;
}

export interface UseEventsBboxResult {
  events: EventResponseDto[];
  geoJson: EventGeoJsonCollection;
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  refetch: () => Promise<unknown>;
  // Çevrimdışı ve demo durumu kontrolleri
  isDemoData: boolean;
  isOfflineCache: boolean;
  lastUpdatedAt: Date | null;
}

export function useEventsBbox({
  bbox,
  category,
  searchQuery = '',
  enabled = true,
}: UseEventsBboxOptions): UseEventsBboxResult {
  const isValid = Boolean(bbox && validateBBox(bbox));

  const queryKey = useMemo(() => {
    if (!bbox) return ['events', 'bbox', 'initial'];
    return [
      'events',
      'bbox',
      Number(bbox.west.toFixed(3)),
      Number(bbox.south.toFixed(3)),
      Number(bbox.east.toFixed(3)),
      Number(bbox.north.toFixed(3)),
      category || 'all',
    ];
  }, [bbox, category]);

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!bbox) return [];
      return fetchEventsBbox(bbox, category, signal);
    },
    enabled: enabled && isValid,
    staleTime: 1000 * 45, // 45 saniye önbellek
    gcTime: 1000 * 60 * 5, // 5 dakika önbellekte tutma
    retry: 1,
  });

  const rawEvents = query.data || [];

  // Olayları istemci tarafında arama terimine göre filtrele ve GeoJSON'a dönüştür
  const geoJson: EventGeoJsonCollection = useMemo(() => {
    const filtered = searchQuery.trim()
      ? rawEvents.filter(
          (e) =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (e.description &&
              e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (e.district &&
              e.district.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : rawEvents;

    return convertEventsToGeoJson(filtered);
  }, [rawEvents, searchQuery]);

  // Demo verisi mi kontrolü
  const isDemoData = useMemo(() => {
    return rawEvents.length > 0 && rawEvents.some((e) => Boolean(e.isDemo));
  }, [rawEvents]);

  // Çevrimdışı önbellek durumu:
  // Önbellekte gerçek veri mevcut, ancak son API sorgusu başarısız oldu veya duraklatıldı
  const isOfflineCache = useMemo(() => {
    return (
      rawEvents.length > 0 &&
      !isDemoData &&
      (Boolean(query.isError) || query.fetchStatus === 'paused')
    );
  }, [rawEvents.length, isDemoData, query.isError, query.fetchStatus]);

  // Son başarılı önbellek zaman damgası
  const lastUpdatedAt = useMemo(() => {
    return query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null;
  }, [query.dataUpdatedAt]);

  return {
    events: rawEvents,
    geoJson,
    totalCount: geoJson.features.length,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    isDemoData,
    isOfflineCache,
    lastUpdatedAt,
  };
}
