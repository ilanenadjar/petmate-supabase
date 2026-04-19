import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Coins, Images } from "lucide-react";
import { format } from "date-fns";
import { fr, he } from "date-fns/locale";
import PetTypeIcon from "../common/PetTypeIcon";
import ServiceBadge from "../common/ServiceBadge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLang } from "../i18n/LanguageContext";

const priceUnitKeys = {
  per_hour: "perHour", per_day: "perDay", per_walk: "perWalk", negotiable: "negotiable",
};

export default function AdCard({ ad }) {
  const { t, lang } = useLang();
  const locale = lang === "he" ? he : fr;

  // Support both old photo_url and new photos[]
  const mainPhoto = ad.photos?.[0] || ad.photo_url || null;
  const photoCount = ad.photos?.length || (ad.photo_url ? 1 : 0);

  return (
    <Link to={createPageUrl("AdDetail") + `?id=${ad.id}`}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white rounded-2xl">
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
          {mainPhoto ? (
            <img src={mainPhoto} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PetTypeIcon petType={ad.pet_type} size="lg" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className={`${ad.ad_type === "request" ? "bg-rose-500" : "bg-emerald-500"} text-white border-0 text-xs font-semibold px-3 py-1 rounded-full shadow-lg`}>
              {ad.ad_type === "request" ? t("seekingLabel") : t("offeringLabel")}
            </Badge>
          </div>
          {photoCount > 1 && (
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full px-2 py-1 flex items-center gap-1">
              <Images className="w-3 h-3" /> {photoCount}
            </div>
          )}
          {ad.price > 0 && (
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-sm">{ad.price}₪</span>
              <span className="text-xs text-slate-500">{t(priceUnitKeys[ad.price_unit])}</span>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{ad.title}</h3>
            <PetTypeIcon petType={ad.pet_type} size="sm" />
          </div>
          <ServiceBadge serviceType={ad.service_type} />
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {ad.city}{ad.neighborhood ? `, ${ad.neighborhood}` : ""}
            </span>
            {ad.date_from && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(ad.date_from), "d MMM", { locale })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}