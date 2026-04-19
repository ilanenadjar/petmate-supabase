import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "../i18n/LanguageContext";

const cities = [
  "Tel Aviv", "Jerusalem", "Haifa", "Rishon LeZion", "Petah Tikva",
  "Ashdod", "Netanya", "Beer Sheva", "Holon", "Bnei Brak",
  "Ramat Gan", "Herzliya", "Kfar Saba", "Ra'anana", "Rehovot",
  "Bat Yam", "Givatayim", "Ashkelon", "Modiin", "Eilat"
];

export default function AdFilters({ filters, onFilterChange }) {
  const { t } = useLang();
  const [showMore, setShowMore] = useState(false);

  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value === "all" ? "" : value });
  };

  const clearFilters = () => {
    onFilterChange({ ad_type: "", service_type: "", pet_type: "", city: "", search: "" });
  };

  const hasFilters = Object.values(filters).some(v => v && v !== "");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t("search")}
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 rounded-xl border-slate-200 bg-white h-11"
          />
        </div>
        <Select value={filters.ad_type || "all"} onValueChange={(v) => updateFilter("ad_type", v)}>
          <SelectTrigger className="w-[150px] rounded-xl h-11 border-slate-200 bg-white">
            <SelectValue placeholder={t("type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="request">{t("seeking")}</SelectItem>
            <SelectItem value="offer">{t("offering")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.pet_type || "all"} onValueChange={(v) => updateFilter("pet_type", v)}>
          <SelectTrigger className="w-[150px] rounded-xl h-11 border-slate-200 bg-white">
            <SelectValue placeholder={t("animal")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="dog">🐕 {t("dog")}</SelectItem>
            <SelectItem value="cat">🐈 {t("cat")}</SelectItem>
            <SelectItem value="bird">🐦 {t("bird")}</SelectItem>
            <SelectItem value="rabbit">🐇 {t("rabbit")}</SelectItem>
            <SelectItem value="other">🐾 {t("other")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-slate-200" onClick={() => setShowMore(!showMore)}>
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
            <X className="w-4 h-4 mr-1" /> {t("clear")}
          </Button>
        )}
      </div>

      {showMore && (
        <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Select value={filters.service_type || "all"} onValueChange={(v) => updateFilter("service_type", v)}>
            <SelectTrigger className="w-[160px] rounded-xl h-11 border-slate-200 bg-white">
              <SelectValue placeholder={t("service")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="walking">🚶 {t("walking")}</SelectItem>
              <SelectItem value="sitting">🏠 {t("sitting")}</SelectItem>
              <SelectItem value="boarding">🏨 {t("boarding")}</SelectItem>
              <SelectItem value="daycare">☀️ {t("daycare")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.city || "all"} onValueChange={(v) => updateFilter("city", v)}>
            <SelectTrigger className="w-[180px] rounded-xl h-11 border-slate-200 bg-white">
              <SelectValue placeholder={t("city")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCities")}</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}