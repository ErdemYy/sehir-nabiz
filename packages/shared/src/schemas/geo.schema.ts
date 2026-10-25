import { z } from 'zod';

export const GeoCoordinateSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Enlem -90 ile 90 arasında olmalıdır')
    .max(90, 'Enlem -90 ile 90 arasında olmalıdır'),
  longitude: z
    .number()
    .min(-180, 'Boylam -180 ile 180 arasında olmalıdır')
    .max(180, 'Boylam -180 ile 180 arasında olmalıdır'),
});

export const BoundingBoxSchema = z.object({
  minLatitude: z.number().min(-90).max(90),
  minLongitude: z.number().min(-180).max(180),
  maxLatitude: z.number().min(-90).max(90),
  maxLongitude: z.number().min(-180).max(180),
});

export const GeoRadiusQuerySchema = GeoCoordinateSchema.extend({
  radiusInMeters: z
    .number()
    .min(50, 'Yarıçap en az 50 metre olmalıdır')
    .max(50000, 'Yarıçap en fazla 50 km olabilir'),
});
