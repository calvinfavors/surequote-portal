import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import type { Feature, Polygon } from 'geojson';

export interface BuildingResult {
  polygon: Feature<Polygon> | null;
  perimeterFeet: number;
}

export function queryBuildingAtPoint(
  map: mapboxgl.Map,
  center: [number, number]
): BuildingResult {
  const point = map.project(center);
  const searchRadius = 30;
  const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
    [point.x - searchRadius, point.y - searchRadius],
    [point.x + searchRadius, point.y + searchRadius],
  ];

  const features = map.queryRenderedFeatures(bbox, {
    layers: ['building-footprint'],
  });

  const building = features.find(
    (f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
  );

  if (!building) {
    return { polygon: null, perimeterFeet: 0 };
  }

  const flattened = turf.flatten(building as unknown as Feature<Polygon>);
  const polygon = flattened.features[0] as Feature<Polygon>;

  if (!polygon) {
    return { polygon: null, perimeterFeet: 0 };
  }

  const perimeterMiles = turf.length(polygon, { units: 'miles' });
  const perimeterFeet = Math.round(perimeterMiles * 5280);

  return { polygon, perimeterFeet };
}
