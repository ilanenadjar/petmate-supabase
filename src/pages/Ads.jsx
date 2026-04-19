import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdCard from "../components/ads/AdCard";
import AdFilters from "../components/ads/AdFilters";
import AdsMap from "../components/map/AdsMap";
import GeoLocationBanner from "../components/ads/GeoLocationBanner";
import SmartMatchPanel from "../components/ads/SmartMatchPanel";
import { Button } from "@/components/ui/button";
import { Map, LayoutGrid, Plus, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "../components/i18n/LanguageContext";

export default function Ads() {
  const { t } = useLang();
  const [filters, setFilters] = useState({ ad_type: "", service_type: "", pet_type: "", city: "", search: "" });
  const [viewMode, setViewMode] = useState("grid");
  const [userCoords, setUserCoords] = useState(null); // { latitude, longitude, city }

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["ads"],
    queryFn: () => base44.entities.PetAd.filter({ status: "active" }, "-created_date", 100),
  });

  const filteredAds = ads.filter(ad => {
    if (filters.ad_type && ad.ad_type !== filters.ad_type) return false;
    if (filters.service_type && ad.service_type !== filters.service_type) return false;
    if (filters.pet_type && ad.pet_type !== filters.pet_type) return false;
    if (filters.city && ad.city !== filters.city) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (ad.title?.toLowerCase().includes(q) || ad.description?.toLowerCase().includes(q) || ad.city?.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("adsTitle")}</h1>
            <p className="text-slate-500 mt-1">{filteredAds.length} {t("adsFound")}</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg ${viewMode === "grid" ? "bg-slate-900 text-white" : ""}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className={`rounded-lg ${viewMode === "map" ? "bg-slate-900 text-white" : ""}`}
              >
                <Map className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "smart" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("smart")}
                className={`rounded-lg gap-1 ${viewMode === "smart" ? "bg-orange-500 text-white" : "text-orange-500"}`}
                title="Smart Match — find the best nearby sitters"
              >
                <Zap className="w-4 h-4" />
              </Button>
            </div>
            <Link to={createPageUrl("CreateAd")}>
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-orange-500/20">
                <Plus className="w-4 h-4 mr-2" /> {t("publish")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <GeoLocationBanner
            onCityDetected={(city, coords) => {
              setFilters(f => ({ ...f, city }));
              if (coords) setUserCoords({ ...coords, city });
            }}
          />
        </div>

        <div className="mb-8">
          <AdFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {viewMode === "smart" ? (
          userCoords ? (
            <SmartMatchPanel userCoords={userCoords} />
          ) : (
            <div className="text-center py-16 space-y-3">
              <Zap className="w-12 h-12 mx-auto text-orange-300" />
              <p className="font-semibold text-slate-700">Smart Match requires your location</p>
              <p className="text-sm text-slate-500">Allow location access or use the banner above to detect your city.</p>
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl mt-2"
                onClick={() => {
                  navigator.geolocation?.getCurrentPosition(pos => {
                    setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                  });
                }}
              >
                <Zap className="w-4 h-4 mr-2" /> Detect my location
              </Button>
            </div>
          )
        ) : viewMode === "map" ? (
          <div className="h-[600px]">
            <AdsMap ads={filteredAds} className="h-full" />
          </div>
        ) : isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🐾</p>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">{t("noAds")}</h3>
            <p className="text-slate-500 mb-6">{t("noAdsHint")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </div>
        )}
      </div>
    </div>
  );
}