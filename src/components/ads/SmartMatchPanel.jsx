import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { smartMatch, buildRatingMap } from "@/lib/smartMatch";
import AdCard from "./AdCard";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Zap, Star, Navigation } from "lucide-react";

export default function SmartMatchPanel({ userCoords }) {
  const [maxRadiusKm, setMaxRadiusKm] = useState(10);
  const [serviceType, setServiceType] = useState("");
  const [petType, setPetType] = useState("");

  const { data: ads = [] } = useQuery({
    queryKey: ["ads-smart"],
    queryFn: () => base44.entities.PetAd.filter({ status: "active" }, "-created_date", 200),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews-smart"],
    queryFn: () => base44.entities.Review.list("-created_date", 500),
  });

  const ratingMap = buildRatingMap(reviews);

  const results = smartMatch(userCoords, ads, ratingMap, {
    maxRadiusKm,
    topN: 10,
    serviceType,
    petType,
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-slate-800">Smart Match — Near You</h3>
          <span className="ml-auto text-xs text-slate-400 flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            {userCoords.city || `${userCoords.latitude.toFixed(3)}, ${userCoords.longitude.toFixed(3)}`}
          </span>
        </div>

        {/* Radius slider */}
        <div>
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Maximum radius</span>
            <span className="font-semibold text-orange-600">{maxRadiusKm} km</span>
          </div>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[maxRadiusKm]}
            onValueChange={([v]) => setMaxRadiusKm(v)}
            className="accent-orange-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1 km</span><span>50 km</span>
          </div>
        </div>

        {/* Service & pet type */}
        <div className="flex flex-wrap gap-3">
          <Select value={serviceType || "all"} onValueChange={v => setServiceType(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px] rounded-xl h-10 border-slate-200 text-sm">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              <SelectItem value="walking">🚶 Walking</SelectItem>
              <SelectItem value="sitting">🏠 Sitting</SelectItem>
              <SelectItem value="boarding">🏨 Boarding</SelectItem>
              <SelectItem value="daycare">☀️ Daycare</SelectItem>
            </SelectContent>
          </Select>
          <Select value={petType || "all"} onValueChange={v => setPetType(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[150px] rounded-xl h-10 border-slate-200 text-sm">
              <SelectValue placeholder="All animals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All animals</SelectItem>
              <SelectItem value="dog">🐕 Dog</SelectItem>
              <SelectItem value="cat">🐈 Cat</SelectItem>
              <SelectItem value="bird">🐦 Bird</SelectItem>
              <SelectItem value="rabbit">🐇 Rabbit</SelectItem>
              <SelectItem value="other">🐾 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Score legend */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> 50% proximity</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 35% rating</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> 15% recency</span>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No pet-sitters found within {maxRadiusKm} km</p>
          <p className="text-sm mt-1">Try increasing the radius</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            <span className="font-semibold text-slate-700">{results.length}</span> pet-sitter{results.length > 1 ? "s" : ""} found within <span className="font-semibold text-orange-600">{maxRadiusKm} km</span>
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((ad) => (
              <div key={ad.id} className="relative">
                {/* Score badge */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                  <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {Math.round(ad.score * 100)}
                  </span>
                  <span className="bg-white text-slate-700 text-xs font-medium rounded-full px-2.5 py-1 shadow border border-slate-100 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-400" /> {ad.distanceKm.toFixed(1)} km
                  </span>
                  {ad.avgRating > 0 && (
                    <span className="bg-white text-amber-600 text-xs font-medium rounded-full px-2.5 py-1 shadow border border-slate-100 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {ad.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <AdCard ad={ad} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}