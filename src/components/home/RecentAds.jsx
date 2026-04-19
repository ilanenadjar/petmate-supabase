import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdCard from "../ads/AdCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "../i18n/LanguageContext";

export default function RecentAds() {
  const { t } = useLang();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["recentAds"],
    queryFn: () => base44.entities.PetAd.filter({ status: "active" }, "-created_date", 6),
  });

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{t("recentTitle")}</h2>
            <p className="text-slate-500">{t("recentSub")}</p>
          </div>
          <Link to={createPageUrl("Ads")}>
            <Button variant="ghost" className="hidden md:flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-medium">
              {t("seeAll")} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg mb-4">{t("noAds")}</p>
            <Link to={createPageUrl("CreateAd")}>
              <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl">{t("beFirst")}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <Link to={createPageUrl("Ads")}>
            <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl">
              {t("seeAllAds")} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}