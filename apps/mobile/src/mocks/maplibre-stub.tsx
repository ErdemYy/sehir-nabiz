import React, { forwardRef, useImperativeHandle } from 'react';
import { View, type ViewProps, type NativeSyntheticEvent } from 'react-native';

/**
 * Expo Go Uyumlu MapLibre Native Stub Modülü
 * 
 * Bu dosya, Expo Go ortamında @maplibre/maplibre-react-native modülünün
 * native kod eksikliği nedeniyle uygulamanın çökmesini engeller.
 * Sadece Expo Go önizleme modunda Metro çözümleyicisi tarafından devreye sokulur.
 */

export interface CameraRef {
  flyTo: (options: {
    center?: [number, number];
    zoom?: number;
    duration?: number;
  }) => void;
  setCamera?: (config: any) => void;
  fitBounds?: (
    northEast: [number, number],
    southWest: [number, number],
    padding?: number | number[],
    duration?: number,
  ) => void;
}

export interface MapRef {
  getCenter?: () => Promise<[number, number]>;
  getZoom?: () => Promise<number>;
  getVisibleBounds?: () => Promise<[[number, number], [number, number]]>;
}

export interface ViewStateChangeEvent {
  bounds?: [number, number, number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
}

export interface PressEventWithFeatures {
  features: Array<{
    type?: string;
    properties?: any;
    geometry?: any;
  }>;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  point?: {
    x: number;
    y: number;
  };
}

export const Map = forwardRef<MapRef, ViewProps & {
  mapStyle?: string;
  attribution?: boolean;
  attributionPosition?: any;
  logo?: boolean;
  onRegionDidChange?: (e: NativeSyntheticEvent<ViewStateChangeEvent>) => void;
  children?: React.ReactNode;
}>(function MapStub(props, ref) {
  useImperativeHandle(ref, () => ({
    getCenter: async () => [35.4853, 38.7225],
    getZoom: async () => 12.5,
    getVisibleBounds: async () => [
      [35.3853, 38.6225],
      [35.5853, 38.8225],
    ],
  }));

  return <View style={props.style}>{props.children}</View>;
});

export const Camera = forwardRef<CameraRef, {
  initialViewState?: {
    center?: [number, number];
    zoom?: number;
  };
  children?: React.ReactNode;
}>(function CameraStub(_props, ref) {
  useImperativeHandle(ref, () => ({
    flyTo: (_opts) => {},
    setCamera: (_cfg) => {},
    fitBounds: (_ne, _sw) => {},
  }));

  return null;
});

export function GeoJSONSource(props: {
  id?: string;
  data?: any;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoom?: number;
  onPress?: (e: any) => void;
  children?: React.ReactNode;
}): React.ReactElement {
  return <>{props.children}</>;
}

export function Layer(_props: any): null {
  return null;
}

export function UserLocation(_props: any): null {
  return null;
}

export function NativeUserLocation(_props: any): null {
  return null;
}

export function ViewAnnotation(_props: any): null {
  return null;
}

export function LayerAnnotation(_props: any): null {
  return null;
}

export function Callout(_props: any): null {
  return null;
}

export function Marker(_props: any): null {
  return null;
}

export function Images(_props: any): null {
  return null;
}

export function ImageSource(_props: any): null {
  return null;
}

export function RasterSource(_props: any): null {
  return null;
}

export function RasterDEMSource(_props: any): null {
  return null;
}

export function VectorSource(_props: any): null {
  return null;
}

export const LocationManager = {
  start: () => {},
  stop: () => {},
};

export const LogManager = {
  setLogLevel: () => {},
};

export const OfflineManager = {};
export const NetworkManager = {};

export default {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  UserLocation,
};
