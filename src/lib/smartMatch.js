/**
 * PetMate Smart Matching Engine
 * Finds the best pet-sitters near a user using a composite score:
 *   score = 0.5 * (1 - distNorm) + 0.35 * ratingNorm + 0.15 * recencyNorm
 */

/**
 * Haversine distance in kilometres between two lat/lng points.
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Build a lookup: adId → average rating (from reviews array).
 */
export function buildRatingMap(reviews) {
  const map = {};
  for (const r of reviews) {
    if (!map[r.ad_id]) map[r.ad_id] = { sum: 0, count: 0 };
    map[r.ad_id].sum += r.rating;
    map[r.ad_id].count += 1;
  }
  const result = {};
  for (const [id, { sum, count }] of Object.entries(map)) {
    result[id] = sum / count;
  }
  return result;
}

/**
 * Smart match:
 * @param {object} userCoords  { latitude, longitude }
 * @param {Array}  ads         PetAd records (must be "offer" type with lat/lng)
 * @param {object} ratingMap   { adId: avgRating } from buildRatingMap()
 * @param {object} options     { maxRadiusKm, topN, serviceType, petType }
 * @returns Array of ads sorted by composite score, each augmented with:
 *          .distanceKm, .avgRating, .score
 */
export function smartMatch(userCoords, ads, ratingMap = {}, options = {}) {
  const {
    maxRadiusKm = 20,
    topN = 10,
    serviceType = "",
    petType = "",
  } = options;

  const { latitude: uLat, longitude: uLon } = userCoords;

  // 1. Filter: offers only, has coords, within radius, optional type filters
  let candidates = ads
    .filter((ad) => ad.ad_type === "offer" && ad.latitude && ad.longitude)
    .filter((ad) => !serviceType || ad.service_type === serviceType)
    .filter((ad) => !petType || ad.pet_type === petType)
    .map((ad) => {
      const distanceKm = haversineKm(uLat, uLon, ad.latitude, ad.longitude);
      const avgRating = ratingMap[ad.id] ?? 0;
      // Recency: days since creation (capped at 90)
      const agedays = ad.created_at
        ? Math.min(
            (Date.now() - new Date(ad.created_at)) / 86400000,
            90
          )
        : 90;
      return { ...ad, distanceKm, avgRating, agedays };
    })
    .filter((ad) => ad.distanceKm <= maxRadiusKm);

  if (candidates.length === 0) return [];

  // 2. Normalize each dimension [0,1]
  const maxDist = Math.max(...candidates.map((a) => a.distanceKm));
  const maxRating = 5;
  const maxAge = 90;

  candidates = candidates.map((ad) => {
    const distNorm = maxDist > 0 ? ad.distanceKm / maxDist : 0;
    const ratingNorm = ad.avgRating / maxRating;
    const recencyNorm = 1 - ad.agedays / maxAge;

    const score =
      0.5 * (1 - distNorm) + 0.35 * ratingNorm + 0.15 * recencyNorm;

    return { ...ad, score: Math.round(score * 100) / 100 };
  });

  // 3. Sort by score desc, take topN
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}