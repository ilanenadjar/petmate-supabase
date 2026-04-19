import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, CreditCard, Building2, CheckCircle2, ExternalLink, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMonths, addDays } from "date-fns";

// ⚙️ CONFIGURE YOUR PAYPAL & BANK DETAILS HERE
const PAYPAL_EMAIL = "votre-email@paypal.com";
const BANK_DETAILS = {
  bank: "Bank Hapoalim",
  branch: "123",
  account: "12-345678",
  owner: "PetSitIL Ltd",
  iban: "IL00 0000 0000 0000 0000 000",
};

export default function PaymentModal({ plan, user, lang, onClose }) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState(null);
  const [step, setStep] = useState("choose"); // choose | details | success
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState("");

  const isHe = lang === "he";
  const planLabel = isHe ? plan.labelHe : plan.labelFr;

  const validUntil = plan.id === "monthly"
    ? format(addMonths(new Date(), 1), "yyyy-MM-dd")
    : format(addDays(new Date(), 30), "yyyy-MM-dd");

  const submitOrder = useMutation({
    mutationFn: () => base44.entities.Order.create({
      plan_id: plan.id,
      plan_label: planLabel,
      amount: plan.price,
      credits: plan.credits,
      payment_method: method,
      status: "pending",
      user_email: email,
      user_name: name,
      notes,
      valid_until: validUntil,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      setStep("success");
    },
  });

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const CopyBtn = ({ text, id }) => (
    <button
      type="button"
      onClick={() => copyText(text, id)}
      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
    >
      {copied === id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
    </button>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          dir={isHe ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{isHe ? "תשלום" : "Paiement"}</h2>
              <p className="text-slate-400 text-sm mt-0.5">{planLabel} — <span className="text-amber-400 font-bold">{plan.price}₪</span></p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* STEP 1: Choose method */}
            {step === "choose" && (
              <div className="space-y-4">
                <p className="text-slate-600 text-sm mb-6">
                  {isHe ? "בחרו אמצעי תשלום:" : "Choisissez votre moyen de paiement :"}
                </p>
                <button
                  onClick={() => { setMethod("paypal"); setStep("details"); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-extrabold text-sm">PP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">PayPal</p>
                    <p className="text-xs text-slate-500">{isHe ? "תשלום מאובטח דרך PayPal" : "Paiement sécurisé via PayPal"}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                </button>
                <button
                  onClick={() => { setMethod("bank_transfer"); setStep("details"); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{isHe ? "העברה בנקאית" : "Virement bancaire"}</p>
                    <p className="text-xs text-slate-500">{isHe ? "העברה ישירה לחשבון הבנק שלנו" : "Virement direct sur notre compte"}</p>
                  </div>
                </button>
              </div>
            )}

            {/* STEP 2: Details + payment instructions */}
            {step === "details" && (
              <div className="space-y-4">
                {/* Contact fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">{isHe ? "שם" : "Nom"}</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-10 mt-1 border-slate-200 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Email</Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="rounded-xl h-10 mt-1 border-slate-200 text-sm" />
                  </div>
                </div>

                {/* PayPal instructions */}
                {method === "paypal" && (
                  <div className="bg-blue-50 rounded-2xl p-4 space-y-3 border border-blue-200">
                    <p className="font-semibold text-blue-800 text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {isHe ? "הוראות PayPal" : "Instructions PayPal"}
                    </p>
                    <p className="text-xs text-blue-700">
                      {isHe ? "שלחו את הסכום לכתובת PayPal הבאה:" : "Envoyez le montant sur l'adresse PayPal suivante :"}
                    </p>
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-blue-200">
                      <span className="font-mono text-sm font-bold text-slate-800">{PAYPAL_EMAIL}</span>
                      <CopyBtn text={PAYPAL_EMAIL} id="paypal" />
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-blue-200">
                      <span className="text-sm text-slate-700">{isHe ? "סכום:" : "Montant :"} <strong>{plan.price}₪</strong></span>
                    </div>
                    <a
                      href={`https://www.paypal.me/${PAYPAL_EMAIL.split("@")[0]}/${plan.price}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-9 text-sm mt-1">
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        {isHe ? "פתח PayPal" : "Ouvrir PayPal"}
                      </Button>
                    </a>
                  </div>
                )}

                {/* Bank transfer instructions */}
                {method === "bank_transfer" && (
                  <div className="bg-emerald-50 rounded-2xl p-4 space-y-2 border border-emerald-200">
                    <p className="font-semibold text-emerald-800 text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {isHe ? "פרטי הבנק" : "Coordonnées bancaires"}
                    </p>
                    {[
                      { label: isHe ? "בנק" : "Banque", value: BANK_DETAILS.bank, id: "bank" },
                      { label: isHe ? "סניף" : "Agence", value: BANK_DETAILS.branch, id: "branch" },
                      { label: isHe ? "חשבון" : "Compte", value: BANK_DETAILS.account, id: "account" },
                      { label: isHe ? "שם" : "Titulaire", value: BANK_DETAILS.owner, id: "owner" },
                      { label: "IBAN", value: BANK_DETAILS.iban, id: "iban" },
                    ].map(row => (
                      <div key={row.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-1.5 border border-emerald-100">
                        <div>
                          <span className="text-xs text-slate-500">{row.label}: </span>
                          <span className="font-mono text-sm font-semibold">{row.value}</span>
                        </div>
                        <CopyBtn text={row.value} id={row.id} />
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-1.5 border border-amber-200 mt-1">
                      <span className="text-sm text-slate-700">{isHe ? "סכום לשלם:" : "Montant à virer :"} <strong className="text-amber-700">{plan.price}₪</strong></span>
                    </div>
                  </div>
                )}

                {/* Reference note */}
                <div>
                  <Label className="text-xs font-semibold text-slate-600">
                    {isHe ? "הערה (אסמכתא)" : "Note / Référence"}
                  </Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={isHe ? "הכניסו את מספר האסמכתא של התשלום..." : "Indiquez votre référence de paiement..."}
                    className="rounded-xl border-slate-200 text-sm min-h-[60px] mt-1"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("choose")} className="flex-1 rounded-xl border-slate-200">
                    {isHe ? "חזרה" : "Retour"}
                  </Button>
                  <Button
                    onClick={() => submitOrder.mutate()}
                    disabled={submitOrder.isPending || !email}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl hover:opacity-90"
                  >
                    {isHe ? "אישור הזמנה" : "Confirmer la commande"}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Success */}
            {step === "success" && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isHe ? "ההזמנה התקבלה!" : "Commande enregistrée !"}
                </h3>
                <p className="text-slate-600 text-sm">
                  {isHe
                    ? "קיבלנו את בקשתכם. לאחר אישור התשלום (עד 24 שעות), הקרדיטים יתווספו לחשבון שלכם."
                    : "Votre commande a été enregistrée. Après confirmation du paiement (sous 24h), vos crédits seront ajoutés à votre compte."}
                </p>
                <Badge className="bg-amber-100 text-amber-700 border-0 text-sm px-4 py-1">
                  {isHe ? `תוכנית: ${planLabel} — ${plan.price}₪` : `Plan : ${planLabel} — ${plan.price}₪`}
                </Badge>
                <Button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl mt-2">
                  {isHe ? "סגור" : "Fermer"}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}