import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import PetTypeIcon from "../common/PetTypeIcon";
import ServiceBadge from "../common/ServiceBadge";
import { MapPin, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { base44 } from "@/api/base44Client";

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const petIcons = {
  dog: "🐕",
  cat: "🐈",
  bird: "🐦",
  rabbit: "🐇",
  other: "🐾",
};

function createCustomIcon(petType, adType) {
  const emoji = petIcons[petType] || "🐾";
  const bgColor = adType === "request" ? "#ef4444" : "#22c55e";
  return L.divIcon({
    html: `<div style="background:${bgColor};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${emoji}</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function FitBounds({ ads }) {
  const map = useMap();
  useEffect(() => {
    const validAds = ads.filter(a => a.latitude && a.longitude);
    if (validAds.length > 0) {
      const bounds = L.latLngBounds(validAds.map(a => [a.latitude, a.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [ads, map]);
  return null;
}

function createFlashIcon() {
  return L.divIcon({
    html: `<div style="background:#f59e0b;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid white;box-shadow:0 0 0 4px rgba(245,158,11,0.35),0 4px 12px rgba(0,0,0,0.3);animation:pulse 1.5s infinite">⚡</div>`,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export default function AdsMap({ ads, className = "" }) {
  const center = [32.0853, 34.7818]; // Tel Aviv
  const [flashSitters, setFlashSitters] = useState([]);

  useEffect(() => {
    const now = new Date();
    base44.entities.FlashSitter.filter({ is_active: true }, "-created_date", 50)
      .then(records => setFlashSitters(records.filter(r => new Date(r.expires_at) > now)));

    const unsub = base44.entities.FlashSitter.subscribe(() => {
      base44.entities.FlashSitter.filter({ is_active: true }, "-created_date", 50)
        .then(records => setFlashSitters(records.filter(r => new Date(r.expires_at) > new Date())));
    });
    return unsub;
  }, []);

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border border-slate-200 ${className}`}>
      <MapContainer center={center} zoom={10} className="w-full h-full" style={{ minHeight: "400px" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds ads={ads} />

        {/* Regular ad markers */}
        {ads.filter(a => a.latitude && a.longitude).map(ad => (
          <Marker key={ad.id} position={[ad.latitude, ad.longitude]} icon={createCustomIcon(ad.pet_type, ad.ad_type)}>
            <Popup>
              <Link to={createPageUrl("AdDetail") + `?id=${ad.id}`} className="block space-y-2 min-w-[180px]">
                <p className="font-semibold text-sm">{ad.title}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {ad.city}
                </p>
                {ad.price > 0 && (
                  <p className="text-xs font-medium flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-500" />
                    {ad.price}₪
                  </p>
                )}
                <span className="text-xs text-orange-600 font-medium">Voir l'annonce →</span>
              </Link>
            </Popup>
          </Marker>
        ))}

        {/* Flash sitter markers */}
        {flashSitters.map(f => (
          <Marker key={f.id} position={[f.latitude, f.longitude]} icon={createFlashIcon()}>
            <Popup>
              <div className="space-y-1.5 min-w-[180px]">
                <p className="font-bold text-amber-600 flex items-center gap-1">⚡ Mode Flash</p>
                <p className="font-semibold text-sm text-slate-800">{f.sitter_name}</p>
                <p className="text-xs text-slate-500 italic">"{f.message}"</p>
                <p className="text-xs text-green-600 font-medium">✓ Disponible maintenant</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}