import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme';
import { MAP_CONFIG } from '../config/mapConfig';
import type {
  BBoxCoordinates,
  EventGeoJsonCollection,
  MapStyleMode,
  MapEventProperties,
} from '../types/map.types';

export interface PulseMapViewProps {
  geoJson: EventGeoJsonCollection;
  styleMode?: MapStyleMode;
  selectedEventId?: string | null;
  onSelectEvent?: (event: MapEventProperties) => void;
  onBBoxChange?: (bbox: BBoxCoordinates) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  cameraRef?: React.RefObject<any>;
  showHeatmap?: boolean;
  heatmapGeoJson?: any;
}

declare global {
  interface Window {
    L?: any;
  }
}

export function PulseMapView({
  geoJson,
  styleMode: _styleMode = 'light',
  selectedEventId,
  onSelectEvent,
  onBBoxChange,
  userCoords,
  showHeatmap = false,
  heatmapGeoJson,
}: PulseMapViewProps): React.ReactElement {
  const { isDark, theme } = useAppTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);

  // 1. Leaflet CSS & JS dinamik yükleme
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapContainerRef.current || leafletMapRef.current || !window.L) return;

      const initialLat = userCoords?.latitude ?? MAP_CONFIG.defaultCamera.latitude;
      const initialLng = userCoords?.longitude ?? MAP_CONFIG.defaultCamera.longitude;

      const map = window.L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: MAP_CONFIG.defaultCamera.zoomLevel,
        zoomControl: false,
      });

      window.L.control.zoom({ position: 'topright' }).addTo(map);

      // Web karo sağlayıcısı (Açık/Koyu tema)
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      window.L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = window.L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      const heatGroup = window.L.layerGroup().addTo(map);
      heatmapLayerRef.current = heatGroup;

      leafletMapRef.current = map;

      // Harita hareket ettiğinde BBox bildirme
      map.on('moveend', () => {
        if (!onBBoxChange) return;
        const bounds = map.getBounds();
        onBBoxChange({
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        });
      });

      // İlk BBox'ı hemen tetikle
      const initialBounds = map.getBounds();
      onBBoxChange?.({
        west: initialBounds.getWest(),
        south: initialBounds.getSouth(),
        east: initialBounds.getEast(),
        north: initialBounds.getNorth(),
      });
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // 2. Tema değişiminde karoyu güncelle
  useEffect(() => {
    if (!leafletMapRef.current || !window.L) return;
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    leafletMapRef.current.eachLayer((layer: any) => {
      if (layer instanceof window.L.TileLayer) {
        leafletMapRef.current.removeLayer(layer);
      }
    });

    window.L.tileLayer(tileUrl, {
      attribution: '&copy; CARTO &copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(leafletMapRef.current);
  }, [isDark]);

  // 3. Olay markerlarını çiz
  useEffect(() => {
    if (!markersLayerRef.current || !window.L) return;
    markersLayerRef.current.clearLayers();

    geoJson?.features?.forEach((f: any) => {
      const [lng, lat] = f.geometry.coordinates;
      const props = f.properties as MapEventProperties;
      const isSelected = props.id === selectedEventId;
      const color = props.categoryColor || theme.primary;

      const circle = window.L.circleMarker([lat, lng], {
        radius: isSelected ? 12 : 9,
        fillColor: color,
        color: '#FFFFFF',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      circle.on('click', () => {
        if (onSelectEvent) {
          onSelectEvent(props);
        }
      });

      circle.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 12px; font-weight: 600;">${props.title}</div>`,
        { direction: 'top', offset: [0, -8] }
      );

      markersLayerRef.current.addLayer(circle);
    });
  }, [geoJson, selectedEventId, theme.primary, onSelectEvent]);

  // 4. Isı Haritası (Heatmap) katmanını çiz
  useEffect(() => {
    if (!heatmapLayerRef.current || !window.L) return;
    heatmapLayerRef.current.clearLayers();

    if (!showHeatmap || !heatmapGeoJson?.features) return;

    heatmapGeoJson.features.forEach((f: any) => {
      const [lng, lat] = f.geometry.coordinates;
      const weight = f.properties?.weight ?? 0.5;

      const circle = window.L.circle([lat, lng], {
        radius: 200,
        fillColor: weight > 0.7 ? '#EF4444' : weight > 0.4 ? '#F97316' : '#2DD4BF',
        color: 'transparent',
        fillOpacity: Math.min(0.65, weight * 0.7),
      });

      heatmapLayerRef.current.addLayer(circle);
    });
  }, [showHeatmap, heatmapGeoJson]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
        }}
      />
    </View>
  );
}
