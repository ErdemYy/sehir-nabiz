import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { BBoxCoordinates, EventGeoJsonCollection } from '../types/map.types';
import { fetchEventsBbox } from '../services/eventsApi';
import { convertEventsToGeoJson, validateBBox } from '../utils/geoUtils';

export interface UseEventsBboxOptions {
  bbox: BBoxCoordinates | null;
  category?: string | null;
  searchQuery?: string;
  enabled?: boolean;
}

export function useEventsBbox({
  bbox,
  category,
  searchQuery = '',
  enabled = true,
}: UseEventsBboxOptions) {
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
  });

  // Olayları istemci tarafında arama terimine göre filtrele ve GeoJSON'a dönüştür
  const geoJson: EventGeoJsonCollection = useMemo(() => {
    const rawEvents = query.data || [];
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
  }, [query.data, searchQuery]);

  return {
    ...query,
    events: query.data || [],
    geoJson,
    totalCount: geoJson.features.length,
  };
}
