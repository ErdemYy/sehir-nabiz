import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, type NativeSyntheticEvent } from 'react-native';
import {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  UserLocation,
  type CameraRef,
  type MapRef,
  type ViewStateChangeEvent,
  type PressEventWithFeatures,
} from '@maplibre/maplibre-react-native';
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
  cameraRef?: React.RefObject<CameraRef | null>;
  showHeatmap?: boolean;
  heatmapGeoJson?: any;
}

export function PulseMapView({
  geoJson,
  styleMode = 'light',
  selectedEventId,
  onSelectEvent,
  onBBoxChange,
  userCoords,
  cameraRef: externalCameraRef,
  showHeatmap = false,
  heatmapGeoJson,
}: PulseMapViewProps): React.ReactElement {
  const { isDark } = useAppTheme();
  const mapRef = useRef<MapRef>(null);
  const internalCameraRef = useRef<CameraRef>(null);
  const activeCameraRef = externalCameraRef || internalCameraRef;

  // Tema ve moda göre aktif stil URL'sini seç
  const activeStyleUrl =
    styleMode === 'satellite'
      ? MAP_CONFIG.styles.satellite
      : styleMode === 'dark' || (styleMode === 'light' && isDark)
      ? MAP_CONFIG.styles.dark
      : MAP_CONFIG.styles.light;

  // Kamera hareketi bittiğinde görünür bounding box sınırlarını hesapla
  const handleRegionDidChange = useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      if (!onBBoxChange || !event.nativeEvent?.bounds) return;
      const [west, south, east, north] = event.nativeEvent.bounds;
      onBBoxChange({ west, south, east, north });
    },
    [onBBoxChange]
  );

  // Kullanıcı konumu değiştiğinde yumuşak geçiş
  useEffect(() => {
    if (userCoords && activeCameraRef.current) {
      activeCameraRef.current.flyTo({
        center: [userCoords.longitude, userCoords.latitude],
        zoom: 14,
        duration: 1200,
      });
    }
  }, [userCoords, activeCameraRef]);

  // Harita üzerindeki ShapeSource tıklamaları (Cluster veya Nokta)
  const handleSourcePress = useCallback(
    (event: NativeSyntheticEvent<PressEventWithFeatures>) => {
      const feature = event.nativeEvent.features[0];
      if (!feature) return;

      // 1. Kümeye basıldıysa yakınlaş (Zoom in)
      if (feature.properties?.cluster) {
        const [lon, lat] = (feature.geometry as any).coordinates;
        activeCameraRef.current?.flyTo({
          center: [lon, lat],
          zoom: 14.5,
          duration: 600,
        });
        return;
      }

      // 2. Tekil olay marker'ına basıldıysa seç
      if (feature.properties?.id && onSelectEvent) {
        onSelectEvent(feature.properties as unknown as MapEventProperties);
      }
    },
    [activeCameraRef, onSelectEvent]
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapStyle={activeStyleUrl}
        attribution
        attributionPosition={{ bottom: 84, left: 16 }}
        logo={false}
        onRegionDidChange={handleRegionDidChange}
      >
        <Camera
          ref={activeCameraRef}
          initialViewState={{
            center: [
              MAP_CONFIG.defaultCamera.longitude,
              MAP_CONFIG.defaultCamera.latitude,
            ],
            zoom: MAP_CONFIG.defaultCamera.zoomLevel,
          }}
        />

        {/* Kullanıcı Konumu Noktası */}
        {userCoords ? <UserLocation animated accuracy heading /> : null}

        {/* Yoğunluk Haritası (Heatmap) Katmanı (İsteğe Bağlı) */}
        {showHeatmap && heatmapGeoJson ? (
          <GeoJSONSource id="heatmapSource" data={heatmapGeoJson}>
            <Layer
              id="heatmapLayer"
              type="heatmap"
              style={{
                heatmapWeight: ['get', 'weight'],
                heatmapIntensity: [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 1,
                  15, 3,
                ],
                heatmapColor: [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(33, 102, 172, 0)',
                  0.2, '#2DD4BF',
                  0.4, '#FBBF24',
                  0.7, '#F97316',
                  1, '#EF4444',
                ],
                heatmapRadius: [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 4,
                  12, 22,
                  15, 40,
                ],
                heatmapOpacity: 0.65,
              }}
            />
          </GeoJSONSource>
        ) : null}

        {/* GeoJSON Olay Kaynağı (GPU Kümeleme Özellikli) */}
        <GeoJSONSource
          id="eventsSource"
          data={geoJson}
          cluster={MAP_CONFIG.clustering.enabled}
          clusterRadius={MAP_CONFIG.clustering.radius}
          clusterMaxZoom={MAP_CONFIG.clustering.maxZoom}
          onPress={handleSourcePress}
        >
          {/* 1. Küme Çemberi Katmanı (Adet bazlı dinamik renk ve boyut) */}
          <Layer
            id="clustersCircle"
            type="circle"
            filter={['has', 'point_count']}
            style={{
              circlePitchAlignment: 'map',
              circleColor: [
                'step',
                ['get', 'point_count'],
                '#14B8A6', // 1-9 arası turkuaz
                10,
                '#0EA5E9', // 10-49 arası açık mavi
                50,
                '#F59E0B', // 50-99 arası sarı
                100,
                '#EF4444', // 100+ kırmızı
              ],
              circleRadius: [
                'step',
                ['get', 'point_count'],
                18,
                10,
                22,
                50,
                26,
                100,
                32,
              ],
              circleStrokeWidth: 2.5,
              circleStrokeColor: '#FFFFFF',
              circleOpacity: 0.92,
            }}
          />

          {/* 2. Küme Sayı Metni Katmanı */}
          <Layer
            id="clusterCountText"
            type="symbol"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: 12,
              textColor: '#FFFFFF',
              textPitchAlignment: 'map',
            }}
          />

          {/* 3. Tekil Olay İşaretçileri Katmanı (Kategori renginde) */}
          <Layer
            id="unclusteredEventPoints"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            style={{
              circlePitchAlignment: 'map',
              circleColor: ['get', 'categoryColor'],
              circleRadius: 9,
              circleStrokeWidth: 2.5,
              circleStrokeColor: '#FFFFFF',
              circleOpacity: 0.95,
            }}
          />

          {/* 4. Seçili Olay Vurgu Halkası */}
          {selectedEventId ? (
            <Layer
              id="selectedPointRing"
              type="circle"
              filter={['==', ['get', 'id'], selectedEventId]}
              style={{
                circlePitchAlignment: 'map',
                circleColor: 'transparent',
                circleRadius: 16,
                circleStrokeWidth: 3,
                circleStrokeColor: '#14B8A6',
                circleOpacity: 1,
              }}
            />
          ) : null}
        </GeoJSONSource>
      </Map>
    </View>
  );
}
