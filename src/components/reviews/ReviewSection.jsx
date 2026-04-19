import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import StarRating from "./StarRating";
import { useLang } from "../i18n/LanguageContext";
import { format } from "date-fns";
import { fr, he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

function ReviewCard({ review, locale }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 py-4 border-b border-slate-100 last:border-0"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {review.reviewer_name?.[0]?.toUpperCase() || "?"}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="font-semibold text-slate-900">{review.reviewer_name || "Anonyme"}</span>
            <span className="text-xs text-slate-400 ml-2">
              {format(new Date(review.created_date), "d MMM yyyy", { locale })}
            </span>
          </div>
          <StarRating value={review.rating} readonly size="sm" />
        </div>
        {review.comment && (
          <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function ReviewSection({ adId }) {
  const { t, lang } = useLang();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [showAll, setShowAll] = useState(false);

  const locale = lang === "he" ? he : fr;

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.full_name) setName(u.full_name);
    }).catch(() => {});
  }, []);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", adId],
    queryFn: () => base44.entities.Review.filter({ ad_id: adId }, "-created_date", 50),
    enabled: !!adId,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", adId] });
      setRating(0);
      setComment("");
      setShowForm(false);
    },
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    submitMutation.mutate({
      ad_id: adId,
      reviewer_name: name,
      reviewer_email: user?.email || "",
      rating,
      comment,
    });
  };

  return (
    <Card className="border-0 shadow-xl rounded-3xl overflow-hidden mt-6">
      <CardContent className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t("reviewsTitle")}</h3>
              {avgRating && (
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating value={Math.round(Number(avgRating))} readonly size="sm" />
                  <span className="text-sm font-semibold text-amber-600">{avgRating}</span>
                  <span className="text-xs text-slate-400">({reviews.length} {t("reviewCount")})</span>
                </div>
              )}
            </div>
          </div>
          {user ? (
            <Button
              variant="outline"
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {t("writeReview")}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-slate-400 text-xs" onClick={() => base44.auth.redirectToLogin()}>
              {t("loginToReview")}
            </Button>
          )}
        </div>

        {/* Write review form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mb-6 p-5 bg-orange-50 rounded-2xl border border-orange-100 space-y-4 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Votre note :</span>
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t("yourName")}
                className="rounded-xl border-orange-200 bg-white"
                required
              />
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={t("yourComment")}
                className="rounded-xl border-orange-200 bg-white min-h-[80px]"
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!rating || submitMutation.isPending}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl"
                >
                  {t("submitReview")}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">
                  {t("cancel")}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reviews list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4 py-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-slate-500">{t("noReviews")}</p>
          </div>
        ) : (
          <>
            <div>
              {visibleReviews.map(review => (
                <ReviewCard key={review.id} review={review} locale={locale} />
              ))}
            </div>
            {reviews.length > 3 && (
              <Button
                variant="ghost"
                className="w-full mt-3 text-slate-500 hover:text-slate-700 rounded-xl"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <><ChevronUp className="w-4 h-4 mr-2" /> Voir moins</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-2" /> Voir les {reviews.length - 3} autres avis</>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}