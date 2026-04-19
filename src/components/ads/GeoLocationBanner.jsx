import { useState, useEffect } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Map detected city names to our city list
const cityAliases = {
  "jerusalem": "Jerusalem",
  "tel aviv": "Tel Aviv",
  "tel aviv-yafo": "Tel Aviv",
  "haifa": "Haifa",
  "rishon lezion": "Rishon LeZion",
  "rishon le zion": "Rishon LeZion",
  "petah tikva": "Petah Tikva",
  "ashdod": "Ashdod",
  "netanya": "Netanya",
  "beersheba": "Beer Sheva",
  "beer sheva": "Beer Sheva",
  "holon": "Holon",
  "bnei brak": "Bnei Brak",
  "ramat gan": "Ramat Gan",
  "herzliya": "Herzliya",
  "kfar saba": "Kfar Saba",
  "ra'anana": "Ra'anana",
  "raanana": "Ra'anana",
  "rehovot": "Rehovot",
  "bat yam": "Bat Yam",
  "givatayim": "Givatayim",
  "ashkelon": "Ashkelon",
  "modiin": "Modiin",
  "eilat": "Eilat",
};

function normalizeCity(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  return cityAliases[lower] || null;
}

export default function GeoLocationBanner({ onCityDetected }) {
  const [status, setStatus] = useState("idle"); // idle | loading | found | denied | dismissed
  const [detectedCity, setDetectedCity] = useState(null);
  const [detectedCoords, setDetectedCoords] = useState(null);

  useEffect(() => {
    // Auto-trigger geo on mount
    if (navigator.geolocation) {
      setStatus("loading");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            setDetectedCoords({ latitude, longitude });
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const raw =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              "";
            const city = normalizeCity(raw);
            if (city) {
              setDetectedCity(city);
              setStatus("found");
            } else {
              // No matching city but we have coords — still useful for smart match
              setDetectedCity(null);
              setStatus("idle");
            }
          } catch {
            setStatus("idle");
          }
        },
        () => {
          setStatus("denied");
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const applyCity = () => {
    onCityDetected(detectedCity, detectedCoords);
    setStatus("dismissed");
  };

  if (status === "dismissed" || status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span>Detecting your location...</span>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>Enable location access to find pet-sitters near you</span>
        </div>
        <button onClick={() => setStatus("dismissed")} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (status === "found" && detectedCity) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-100 rounded-2xl">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-slate-700">
            We detected you're in <span className="font-semibold text-orange-600">{detectedCity}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={applyCity}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-8 px-4 text-xs font-semibold"
          >
            Show pet-sitters nearby
          </Button>
          <button onClick={() => setStatus("dismissed")} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}