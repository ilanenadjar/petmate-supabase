import { Button } from "@/components/ui/button";
import { PawPrint, Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function HeroSection() {
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 pt-20 pb-24 px-6">
      <div className="absolute top-10 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-100/20 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-sm border border-white/50">
            <PawPrint className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-slate-600">{t("heroTag")}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-slate-900">{t("heroTitle1")}</span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              {t("heroTitle2")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Ads")}>
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl px-8 h-14 text-base font-semibold shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl">
                <Search className="w-5 h-5 mr-2" />
                {t("browseAds")}
              </Button>
            </Link>
            <Link to={createPageUrl("CreateAd")}>
              <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base font-semibold border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
                <Plus className="w-5 h-5 mr-2" />
                {t("publishAd")}
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 flex justify-center gap-8 md:gap-16 text-center"
        >
          {[
            { num: "500+", labelKey: "statsAds" },
            { num: "1,200+", labelKey: "statsMembers" },
            { num: "20+", labelKey: "statsCities" },
          ].map((stat) => (
            <div key={stat.labelKey}>
              <p className="text-3xl md:text-4xl font-bold text-slate-900">{stat.num}</p>
              <p className="text-sm text-slate-500 mt-1">{t(stat.labelKey)}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}