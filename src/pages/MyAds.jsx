import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Eye, PawPrint, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { fr, he } from "date-fns/locale";
import PetTypeIcon from "../components/common/PetTypeIcon";
import ServiceBadge from "../components/common/ServiceBadge";
import { useState, useEffect } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLang } from "../components/i18n/LanguageContext";

const statusColorMap = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function MyAds() {
  const { t, lang } = useLang();
  const locale = lang === "he" ? he : fr;
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["myAds", user?.email],
    queryFn: () => base44.entities.PetAd.filter({ created_by: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PetAd.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myAds"] }); setDeleteId(null); },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PetAd.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myAds"] }),
  });

  const statusLabel = (s) => {
    const map = { active: "statusActive", paused: "statusPaused", completed: "statusCompleted", cancelled: "statusCancelled" };
    return t(map[s] || s);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("myAdsTitle")}</h1>
            <p className="text-slate-500 mt-1">{ads.length} {t("adsFound")}</p>
          </div>
          <Link to={createPageUrl("CreateAd")}>
            <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-orange-500/20">
              <Plus className="w-4 h-4 mr-2" /> {t("newAd")}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-5 flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20">
            <PawPrint className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">{t("noMyAds")}</h3>
            <p className="text-slate-500 mb-6">{t("noMyAdsHint")}</p>
            <Link to={createPageUrl("CreateAd")}>
              <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl">{t("publishAd")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map(ad => {
              const mainPhoto = ad.photos?.[0] || ad.photo_url || null;
              return (
                <Card key={ad.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        {mainPhoto ? (
                          <img src={mainPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PetTypeIcon petType={ad.pet_type} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-slate-900 truncate">{ad.title}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {ad.city} · {format(new Date(ad.created_date), "d MMM yyyy", { locale })}
                            </p>
                          </div>
                          <Badge className={`${statusColorMap[ad.status]} border-0 text-xs`}>
                            {statusLabel(ad.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <ServiceBadge serviceType={ad.service_type} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                      <Link to={createPageUrl("AdDetail") + `?id=${ad.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1" /> {t("view")}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs"
                        onClick={() => toggleStatusMutation.mutate({ id: ad.id, status: ad.status === "active" ? "paused" : "active" })}
                      >
                        {ad.status === "active" ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                        {ad.status === "active" ? t("pause") : t("activate")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                        onClick={() => setDeleteId(ad.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> {t("delete")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>{t("confirmDeleteDesc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600 rounded-xl" onClick={() => deleteMutation.mutate(deleteId)}>
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}