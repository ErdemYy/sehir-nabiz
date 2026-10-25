/**
 * Coğrafi Koordinat ve Kapsama Alanı Tanımları (WGS 84)
 */

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  minLatitude: number;
  minLongitude: number;
  maxLatitude: number;
  maxLongitude: number;
}

export interface GeoRadiusQuery extends GeoCoordinate {
  radiusInMeters: number;
}
