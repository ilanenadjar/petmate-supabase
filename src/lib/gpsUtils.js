import { haversineKm } from "./smartMatch";

/**
 * Geofence check-in validation.
 * Returns { ok: true, distanceM } if within maxDistanceM, otherwise { ok: false, distanceM, error }.
 */
export function geofenceCheck(sitterLat, sitterLng, ownerLat, ownerLng, maxDistanceM = 100) {
  const distanceM = haversineKm(sitterLat, sitterLng, ownerLat, ownerLng) * 1000;
  if (distanceM <= maxDistanceM) {
    return { ok: true, distanceM: Math.round(distanceM) };
  }
  return {
    ok: false,
    distanceM: Math.round(distanceM),
    error: `Vous êtes à ${Math.round(distanceM)} m de l'adresse du propriétaire (max 100 m). Rapprochez-vous pour démarrer la visite.`,
  };
}

/**
 * Calculate total distance (km) along an ordered array of GPS points.
 * Each point: { lat, lng, ts }
 */
export function calcTotalDistance(points) {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
  }
  return Math.round(total * 1000) / 1000; // 3 decimal places
}

/**
 * Format seconds into MM:SS string.
 */
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Generate a random 8-char share token.
 */
export function generateShareToken() {
  return Math.random().toString(36).substring(2, 10);
}