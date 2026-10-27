import type { EventCategory, EventSeverity, EventStatus } from '@sehir-nabiz/shared';
import type { Feature, FeatureCollection, Point } from 'geojson';

export type MapStyleMode = 'light' | 'dark' | 'satellite';

export interface BBoxCoordinates {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface MapEventProperties {
  id: string;
  title: string;
  category: EventCategory | string;
  severity: EventSeverity;
  status: EventStatus;
  reliabilityScore: number;
  upvotesCount: number;
  downvotesCount: number;
  confirmationCount?: number;
  disputeCount?: number;
  resolvedReportCount?: number;
  isDemo: boolean;
  addressText?: string;
  city?: string;
  district?: string;
  description?: string;
  createdAt: string;
  categoryColor: string;
}

export type EventGeoJsonFeature = Feature<Point, MapEventProperties>;
export type EventGeoJsonCollection = FeatureCollection<Point, MapEventProperties>;

export interface UserLocationState {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  isLoading: boolean;
  error: string | null;
}
