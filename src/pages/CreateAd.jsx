import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PawPrint, Loader2, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import MultiPhotoUpload from "../components/ads/MultiPhotoUpload";
import { useLang } from "../components/i18n/LanguageContext";

const cities = [
  "Tel Aviv", "Jerusalem", "Haifa", "Rishon LeZion", "Petah Tikva",
  "Ashdod", "Netanya", "Beer Sheva", "Holon", "Bnei Brak",
  "Ramat Gan", "Herzliya", "Kfar Saba", "Ra'anana", "Rehovot",
  "Bat Yam", "Givatayim", "Ashkelon", "Modiin", "Eilat"
];

const cityCoords = {
  "Tel Aviv": { lat: 32.0853, lng: 34.7818 }, "Jerusalem": { lat: 31.7683, lng: 35.2137 },
  "Haifa": { lat: 32.7940, lng: 34.9896 }, "Rishon LeZion": { lat: 31.9730, lng: 34.7925 },
  "Petah Tikva": { lat: 32.0841, lng: 34.8878 }, "Ashdod": { lat: 31.8014, lng: 34.6431 },
  "Netanya": { lat: 32.3215, lng: 34.8532 }, "Beer Sheva": { lat: 31.2518, lng: 34.7913 },
  "Holon": { lat: 32.0114, lng: 34.7748 }, "Bnei Brak": { lat: 32.0834, lng: 34.8344 },
  "Ramat Gan": { lat: 32.0680, lng: 34.8248 }, "Herzliya": { lat: 32.1629, lng: 34.8446 },
  "Kfar Saba": { lat: 32.1780, lng: 34.9066 }, "Ra'anana": { lat: 32.1840, lng: 34.8709 },
  "Rehovot": { lat: 31.8928, lng: 34.8113 }, "Bat Yam": { lat: 32.0171, lng: 34.7510 },
  "Givatayim": { lat: 32.0703, lng: 34.8120 }, "Ashkelon": { lat: 31.6688, lng: 34.5743 },
  "Modiin": { lat: 31.8977, lng: 35.0104 }, "Eilat": { lat: 29.5577, lng: 34.9519 },
};

export default function CreateAd() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", ad_type: "request", service_type: "walking",
    pet_type: "dog", pet_name: "", city: "", neighborhood: "",
    price: "", price_unit: "per_hour", date_from: "", date_to: "",
    contact_phone: "", contact_name: "", photos: [], status: "active",
    latitude: null, longitude: null,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PetAd.create(data),
    onSuccess: (result) => {
      navigate(createPageUrl("AdDetail") + `?id=${result.id}`);
    },
  });

  const updateField = (key, value) => {
    const updates = { [key]: value };
    if (key === "city" && cityCoords[value]) {
      const offset = () => (Math.random() - 0.5) * 0.02;
      updates.latitude = cityCoords[value].lat + offset();
      updates.longitude = cityCoords[value].lng + offset();
    }
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price: form.price ? Number(form.price) : 0,
      photo_url: form.photos[0] || "",
    };
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl("Ads")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("backToAds")}
        </Link>

        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-rose-500 text-white p-8">
            <div className="flex items-center gap-3">
              <PawPrint className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl font-bold">{t("newAd")}</CardTitle>
                <p className="text-white/80 mt-1">{t("newAdSub")}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "request", labelKey: "iSeek", emoji: "🔍" },
                  { value: "offer", labelKey: "iOffer", emoji: "🤝" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField("ad_type", opt.value)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      form.ad_type === opt.value
                        ? "border-orange-500 bg-orange-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <p className="font-semibold mt-1">{t(opt.labelKey)}</p>
                  </button>
                ))}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{t("adTitle")} *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder={t("adTitlePlaceholder")}
                  className="rounded-xl h-12 border-slate-200"
                  required
                />
              </div>

              {/* Pet & Service */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("animalLabel")} *</Label>
                  <Select value={form.pet_type} onValueChange={(v) => updateField("pet_type", v)}>
                    <SelectTrigger className="rounded-xl h-12 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">🐕 {t("dog")}</SelectItem>
                      <SelectItem value="cat">🐈 {t("cat")}</SelectItem>
                      <SelectItem value="bird">🐦 {t("bird")}</SelectItem>
                      <SelectItem value="rabbit">🐇 {t("rabbit")}</SelectItem>
                      <SelectItem value="other">🐾 {t("other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("serviceLabel")} *</Label>
                  <Select value={form.service_type} onValueChange={(v) => updateField("service_type", v)}>
                    <SelectTrigger className="rounded-xl h-12 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walking">🚶 {t("walking")}</SelectItem>
                      <SelectItem value="sitting">🏠 {t("sitting")}</SelectItem>
                      <SelectItem value="boarding">🏨 {t("boarding")}</SelectItem>
                      <SelectItem value="daycare">☀️ {t("daycare")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pet name */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{t("petName")}</Label>
                <Input
                  value={form.pet_name}
                  onChange={(e) => updateField("pet_name", e.target.value)}
                  placeholder={t("petNamePlaceholder")}
                  className="rounded-xl h-12 border-slate-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{t("description")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder={t("descPlaceholder")}
                  className="rounded-xl border-slate-200 min-h-[120px]"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("cityLabel")} *</Label>
                  <Select value={form.city} onValueChange={(v) => updateField("city", v)}>
                    <SelectTrigger className="rounded-xl h-12 border-slate-200">
                      <SelectValue placeholder={t("cityPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>
                          <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {city}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("neighborhood")}</Label>
                  <Input
                    value={form.neighborhood}
                    onChange={(e) => updateField("neighborhood", e.target.value)}
                    placeholder={t("neighborhoodPlaceholder")}
                    className="rounded-xl h-12 border-slate-200"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("price")}</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="0"
                    className="rounded-xl h-12 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("priceUnit")}</Label>
                  <Select value={form.price_unit} onValueChange={(v) => updateField("price_unit", v)}>
                    <SelectTrigger className="rounded-xl h-12 border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_hour">{t("perHourLabel")}</SelectItem>
                      <SelectItem value="per_day">{t("perDayLabel")}</SelectItem>
                      <SelectItem value="per_walk">{t("perWalkLabel")}</SelectItem>
                      <SelectItem value="negotiable">{t("negotiableLabel")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("dateFromLabel")}</Label>
                  <Input type="date" value={form.date_from} onChange={(e) => updateField("date_from", e.target.value)} className="rounded-xl h-12 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("dateToLabel")}</Label>
                  <Input type="date" value={form.date_to} onChange={(e) => updateField("date_to", e.target.value)} className="rounded-xl h-12 border-slate-200" />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("yourNameLabel")}</Label>
                  <Input value={form.contact_name} onChange={(e) => updateField("contact_name", e.target.value)} placeholder={t("yourNamePlaceholder")} className="rounded-xl h-12 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{t("phone")}</Label>
                  <Input value={form.contact_phone} onChange={(e) => updateField("contact_phone", e.target.value)} placeholder={t("phonePlaceholder")} className="rounded-xl h-12 border-slate-200" />
                </div>
              </div>

              {/* Multi-photo upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{t("photoLabel")}</Label>
                <MultiPhotoUpload
                  photos={form.photos}
                  onChange={(photos) => updateField("photos", photos)}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={createMutation.isPending || !form.title || !form.city}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-2xl shadow-lg shadow-orange-500/25"
              >
                {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PawPrint className="w-5 h-5 mr-2" />}
                {t("publishBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}