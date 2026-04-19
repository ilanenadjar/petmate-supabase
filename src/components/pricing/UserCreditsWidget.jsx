import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Coins, Crown, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UserCreditsWidget({ userEmail, lang }) {
  const isHe = lang === "he";

  const { data: orders = [] } = useQuery({
    queryKey: ["userCredits", userEmail],
    queryFn: () => base44.entities.Order.filter({ user_email: userEmail, status: "confirmed" }, "-created_date", 50),
    enabled: !!userEmail,
  });

  const { data: myAds = [] } = useQuery({
    queryKey: ["myAdsCount", userEmail],
    queryFn: () => base44.entities.PetAd.filter({ created_by: userEmail }, "", 500),
    enabled: !!userEmail,
  });

  // Check active monthly subscription
  const today = new Date().toISOString().split("T")[0];
  const activeMonthly = orders.find(o => o.plan_id === "monthly" && o.valid_until >= today);

  if (activeMonthly) {
    return (
      <Link to={createPageUrl("Pricing")} className="hidden md:flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 hover:bg-amber-100 transition-colors">
        <Crown className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-semibold text-amber-700">Pro</span>
      </Link>
    );
  }

  // Count remaining pack credits
  const totalCredits = orders
    .filter(o => o.plan_id !== "monthly")
    .reduce((sum, o) => sum + (o.credits || 0), 0);
  const usedAds = myAds.length;
  const remaining = Math.max(0, totalCredits - usedAds);

  return (
    <Link to={createPageUrl("Pricing")} className="hidden md:flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5 hover:bg-orange-100 transition-colors">
      <Coins className="w-3.5 h-3.5 text-orange-500" />
      <span className="text-xs font-semibold text-orange-700">{remaining} {isHe ? "קרדיטים" : "crédits"}</span>
      {remaining === 0 && <Plus className="w-3 h-3 text-orange-400" />}
    </Link>
  );
}