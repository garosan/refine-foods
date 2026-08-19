// Google Maps is mocked for now — no API key provisioned yet (see CLAUDE.md).
// This module is the seam: swap `mockGeocode` for a real Geocoding API call
// and `MockMap` (src/components/mock-map.tsx) for `@vis.gl/react-google-maps`
// (or similar) without touching call sites.

// Roughly the NYC metro area, matching the seed script's store coordinates.
const BOUNDS = { latMin: 40.5, latMax: 40.9, lngMin: -74.1, lngMax: -73.7 };

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for parity with a real geocoding call
export function mockGeocode(address: string) {
  return {
    lat: BOUNDS.latMin + Math.random() * (BOUNDS.latMax - BOUNDS.latMin),
    lng: BOUNDS.lngMin + Math.random() * (BOUNDS.lngMax - BOUNDS.lngMin),
  };
}

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
};
