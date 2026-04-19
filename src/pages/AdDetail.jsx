import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Coins, Phone, User, ArrowLeft, Share2, Heart } from "lucide-react";
import { format } from "date-fns";
import { fr, he } from "date-fns/locale";
import PetTypeIcon from "../components/common/PetTypeIcon";
import ServiceBadge from "../components/common/ServiceBadge";
import AdsMap from "../components/map/AdsMap";
import PhotoGallery from "../components/ads/PhotoGallery";
import ReviewSection from "../components/reviews/ReviewSection";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState } from "react";
import { useLang } from "../components/i18n/LanguageContext";

const petLabels = {
  fr: { dog: "Chien", cat: "Chat", bird: "Oiseau", rabbit: "Lapin", other: "Autre" },
  he: { dog: "כלב", cat: "חתול", bird: "ציפור", rabbit: "ארנב", other: "אחר" },
};

const priceUnitKeys = {
  per_hour: "perHour", per_day: "perDay", per_walk: "perWalk", negotiable: "negotiable",
};

export default function AdDetail() {
  const { t, lang, isRTL } = useLang();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [showPhone, setShowPhone] = useState(false);
  const locale = lang === "he" ? he : fr;

  const { data: ad, isLoading } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => base44.entities.PetAd.filter({ id }, "", 1).then(r => r[0]),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🐾</p>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">{t("noAds")}</h2>
          <Link to={createPageUrl("Ads")}>
            <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl">{t("backToAds")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Build photos array (support both old photo_url and new photos[])
  const allPhotos = ad.photos?.length > 0
    ? ad.photos
    : ad.photo_url
      ? [ad.photo_url]
      : [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to={createPageUrl("Ads")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          {t("backToAds")}
        </Link>

        {/* Main card */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden mb-6">
          {/* Photo Gallery */}
          {allPhotos.length > 0 && <PhotoGallery photos={allPhotos} />}

          <CardContent className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`${ad.ad_type === "request" ? "bg-rose-500" : "bg-emerald-500"} text-white border-0 rounded-full px-4 py-1`}>
                    {ad.ad_type === "request" ? t("seekingLabel") : t("offeringLabel")}
                  </Badge>
                  <ServiceBadge serviceType={ad.service_type} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{ad.title}</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Pet info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <PetTypeIcon petType={ad.pet_type} size="lg" />
              <div>
                <p className="font-semibold text-slate-900">
                  {petLabels[lang]?.[ad.pet_type] || petLabels.fr[ad.pet_type] || ad.pet_type}
                  {ad.pet_name && ` — ${ad.pet_name}`}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {ad.city}{ad.neighborhood ? `, ${ad.neighborhood}` : ""}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ad.price > 0 && (
                <div className="p-4 bg-amber-50 rounded-2xl text-center">
                  <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-amber-700">{ad.price}₪</p>
                  <p className="text-xs text-amber-600">{t(priceUnitKeys[ad.price_unit])}</p>
                </div>
              )}
              {ad.date_from && (
                <div className="p-4 bg-blue-50 rounded-2xl text-center">
                  <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-blue-700">
                    {format(new Date(ad.date_from), "d MMM yyyy", { locale })}
                  </p>
                  <p className="text-xs text-blue-600">{t("dateFrom")}</p>
                </div>
              )}
              {ad.date_to && (
                <div className="p-4 bg-purple-50 rounded-2xl text-center">
                  <Calendar className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-purple-700">
                    {format(new Date(ad.date_to), "d MMM yyyy", { locale })}
                  </p>
                  <p className="text-xs text-purple-600">{t("dateTo")}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {ad.description && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">{t("description")}</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
              </div>
            )}

            {/* Contact */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="font-semibold text-slate-900">{t("contact")}</h3>
              {ad.contact_name && (
                <p className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4 text-slate-400" /> {ad.contact_name}
                </p>
              )}
              {ad.contact_phone && (
                showPhone ? (
                  <a href={`tel:${ad.contact_phone}`} className="flex items-center gap-2 text-orange-600 font-semibold text-lg">
                    <Phone className="w-5 h-5" /> {ad.contact_phone}
                  </a>
                ) : (
                  <Button
                    onClick={() => setShowPhone(true)}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-xl h-12 px-8 shadow-lg shadow-orange-500/20"
                  >
                    <Phone className="w-4 h-4 mr-2" /> {t("showPhone")}
                  </Button>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        {ad.latitude && ad.longitude && (
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden mb-6">
            <CardContent className="p-0">
              <div className="h-[300px]">
                <AdsMap ads={[ad]} className="h-full rounded-none" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <ReviewSection adId={id} />
      </div>
    </div>
  );
}