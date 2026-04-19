import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Star, Crown, PawPrint, CreditCard, Info } from "lucide-react";
import { motion } from "framer-motion";
import PaymentModal from "../components/pricing/PaymentModal";
import { useLang } from "../components/i18n/LanguageContext";

export const PLANS = [
  {
    id: "pack_1",
    icon: PawPrint,
    labelFr: "Annonce unique",
    labelHe: "מודעה בודדת",
    price: 5,
    credits: 1,
    color: "from-slate-400 to-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    featuresFr: ["1 annonce publiée", "Visible 30 jours", "Photos incluses", "Apparition sur la carte"],
    featuresHe: ["מודעה אחת", "נראית 30 יום", "תמונות כלולות", "מופיע על המפה"],
  },
  {
    id: "pack_10",
    icon: Zap,
    labelFr: "Pack 10 annonces",
    labelHe: "חבילת 10 מודעות",
    price: 30,
    credits: 10,
    pricePerUnit: 3,
    popular: false,
    color: "from-orange-400 to-rose-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    featuresFr: ["10 annonces publiées", "Visibles 30 jours chacune", "Photos incluses", "Apparition sur la carte", "Économisez 33%"],
    featuresHe: ["10 מודעות", "נראות 30 יום כל אחת", "תמונות כלולות", "מופיע על המפה", "חסכו 33%"],
  },
  {
    id: "pack_20",
    icon: Star,
    labelFr: "Pack 20 annonces",
    labelHe: "חבילת 20 מודעות",
    price: 50,
    credits: 20,
    pricePerUnit: 2.5,
    popular: true,
    color: "from-rose-500 to-purple-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-300",
    featuresFr: ["20 annonces publiées", "Visibles 30 jours chacune", "Photos incluses", "Mise en avant prioritaire", "Économisez 50%"],
    featuresHe: ["20 מודעות", "נראות 30 יום כל אחת", "תמונות כלולות", "קידום עדיפות", "חסכו 50%"],
  },
  {
    id: "monthly",
    icon: Crown,
    labelFr: "Abonnement mensuel",
    labelHe: "מנוי חודשי",
    price: 99,
    credits: 0,
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    featuresFr: ["Annonces illimitées", "Renouvellement mensuel", "Photos incluses", "Mise en avant prioritaire", "Badge Pro sur le profil"],
    featuresHe: ["מודעות ללא הגבלה", "חידוש חודשי", "תמונות כלולות", "קידום עדיפות", "תג Pro בפרופיל"],
  },
];

function PlanCard({ plan, onSelect, lang, currentPlan }) {
  const labels = lang === "he" ? plan.labelHe : plan.labelFr;
  const features = lang === "he" ? plan.featuresHe : plan.featuresFr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-rose-500 to-purple-600 text-white border-0 shadow-lg px-4 py-1 rounded-full text-xs font-bold">
            ⭐ {lang === "he" ? "הכי פופולרי" : "Le plus populaire"}
          </Badge>
        </div>
      )}
      <Card className={`border-2 ${plan.popular ? plan.borderColor + " shadow-xl scale-105" : plan.borderColor + " shadow-sm hover:shadow-lg"} rounded-3xl overflow-hidden transition-all duration-300 h-full`}>
        <div className={`bg-gradient-to-br ${plan.color} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <plan.icon className="w-8 h-8 opacity-90" />
            {plan.id === "monthly" && (
              <Badge className="bg-white/20 text-white border-0 text-xs">
                {lang === "he" ? "הטוב ביותר" : "Meilleure valeur"}
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-bold mt-3">{labels}</h3>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-extrabold">{plan.price}₪</span>
            <span className="text-white/70 mb-1 text-sm">
              {plan.id === "monthly" ? (lang === "he" ? "/חודש" : "/mois") : ""}
            </span>
          </div>
          {plan.pricePerUnit && (
            <p className="text-white/70 text-sm mt-1">
              {lang === "he" ? `${plan.pricePerUnit}₪ למודעה` : `${plan.pricePerUnit}₪ par annonce`}
            </p>
          )}
        </div>
        <CardContent className={`p-6 ${plan.bgColor} flex flex-col h-full`}>
          <ul className="space-y-3 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => onSelect(plan)}
            className={`w-full mt-6 rounded-2xl h-12 font-semibold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 shadow-lg transition-all`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {lang === "he" ? "בחר תוכנית" : "Choisir ce plan"}
          </Button>
          {currentPlan?.plan_id === plan.id && (
            <p className="text-center text-xs text-emerald-600 font-semibold mt-2">
              {lang === "he" ? "✓ התוכנית הנוכחית שלך" : "✓ Votre plan actuel"}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Pricing() {
  const { lang } = useLang();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myOrders = [] } = useQuery({
    queryKey: ["myOrders", user?.email],
    queryFn: () => base44.entities.Order.filter({ user_email: user.email, status: "confirmed" }, "-created_date", 1),
    enabled: !!user?.email,
  });

  const currentPlan = myOrders[0] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">
              {lang === "he" ? "תוכניות ומחירים" : "Tarifs & Plans"}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            {lang === "he" ? "פרסמו את המודעה שלכם" : "Publiez vos annonces"}
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {lang === "he"
              ? "בחרו את התוכנית המתאימה לכם ופרסמו מיד"
              : "Choisissez le plan adapté à vos besoins et publiez en quelques secondes"}
          </p>
        </motion.div>
      </div>

      {/* Plans grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              lang={lang}
              onSelect={setSelectedPlan}
              currentPlan={currentPlan}
            />
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-4 items-start">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            {lang === "he" ? (
              <p><strong>איך זה עובד?</strong> לאחר בחירת תוכנית, תשלמו דרך PayPal או העברה בנקאית. לאחר אישור התשלום (תוך 24 שעות), הקרדיטים שלכם יתווספו אוטומטית לחשבון.</p>
            ) : (
              <p><strong>Comment ça fonctionne ?</strong> Après avoir choisi un plan, vous payez via PayPal ou virement bancaire. Après confirmation du paiement (sous 24h), vos crédits sont automatiquement ajoutés à votre compte.</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          user={user}
          lang={lang}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}