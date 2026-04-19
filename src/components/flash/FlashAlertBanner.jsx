/**
 * FlashAlertBanner — Owner side
 * Subscribes in real-time to FlashSitter records and shows a banner
 * when a sitter is available within 2 km of the owner's last known position.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { haversineKm } from "@/lib/smartMatch";
import { Zap, X, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const RADIUS_KM = 2;

export default function FlashAlertBanner({ userCoords }) {
  const [nearbyFlash, setNearbyFlash] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  const filterNearby = (records) => {
    const now = new Date();
    return records.filter(r =>
      r.is_active &&
      new Date(r.expires_at) > now &&
      userCoords &&
      haversineKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude) <= RADIUS_KM
    );
  };

  useEffect(() => {
    // Initial fetch
    base44.entities.FlashSitter.filter({ is_active: true }, "-created_date", 50)
      .then(records => setNearbyFlash(filterNearby(records)));

    // Real-time updates
    const unsub = base44.entities.FlashSitter.subscribe((event) => {
      base44.entities.FlashSitter.filter({ is_active: true }, "-created_date", 50)
        .then(records => {
          setNearbyFlash(filterNearby(records));
          setDismissed(false); // re-show on new flash
        });
    });
    return unsub;
  }, [userCoords]);

  if (!nearbyFlash.length || dismissed) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4">
      <div className="bg-amber-400 text-white rounded-2xl shadow-2xl shadow-amber-400/40 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">
            ⚡ {nearbyFlash.length} sitter{nearbyFlash.length > 1 ? "s" : ""} Flash près de vous !
          </p>
          <p className="text-xs text-amber-100 mt-0.5 truncate">
            {nearbyFlash[0].sitter_name} · {nearbyFlash[0].message}
          </p>
          <Link
            to={createPageUrl("Ads") + "?view=map"}
            className="inline-block mt-2 text-xs bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 font-semibold transition-colors"
          >
            <MapPin className="w-3 h-3 inline mr-1" />
            Voir sur la carte
          </Link>
        </div>
        <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}