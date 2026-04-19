/**
 * FlashModeToggle — Sitter side
 * Allows a pet-sitter to activate/deactivate "Flash" availability mode.
 * Stores position + expiry in FlashSitter entity, visible to nearby owners on the map.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Zap, ZapOff, Loader2, MapPin } from "lucide-react";

const FLASH_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export default function FlashModeToggle({ user }) {
  const [flashRecord, setFlashRecord] = useState(null); // active FlashSitter record
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  // Load existing flash record for this sitter
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.FlashSitter.filter({ sitter_email: user.email, is_active: true }, "-created_date", 1)
      .then(records => {
        const active = records.find(r => r.is_active && new Date(r.expires_at) > new Date());
        setFlashRecord(active || null);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  // Countdown timer
  useEffect(() => {
    if (!flashRecord) { setTimeLeft(null); return; }
    const tick = () => {
      const diff = new Date(flashRecord.expires_at) - new Date();
      if (diff <= 0) { setFlashRecord(null); setTimeLeft(null); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s.toString().padStart(2, "0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [flashRecord]);

  const activate = async () => {
    setToggling(true);
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 })
    ).catch(() => null);

    if (!pos) {
      alert("Impossible d'obtenir votre position GPS. Autorisez la géolocalisation.");
      setToggling(false);
      return;
    }

    // Deactivate any old record first
    if (flashRecord) {
      await base44.entities.FlashSitter.update(flashRecord.id, { is_active: false });
    }

    const record = await base44.entities.FlashSitter.create({
      sitter_email: user.email,
      sitter_name: user.full_name || user.email,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      message: message || "Disponible pour promenade immédiate !",
      is_active: true,
      expires_at: new Date(Date.now() + FLASH_DURATION_MS).toISOString(),
    });
    setFlashRecord(record);
    setToggling(false);
  };

  const deactivate = async () => {
    setToggling(true);
    if (flashRecord) {
      await base44.entities.FlashSitter.update(flashRecord.id, { is_active: false });
    }
    setFlashRecord(null);
    setToggling(false);
  };

  if (loading) return null;

  const isFlashActive = !!flashRecord;

  return (
    <div className={`rounded-2xl border p-5 space-y-4 transition-all ${
      isFlashActive
        ? "bg-amber-50 border-amber-300 shadow-amber-100 shadow-md"
        : "bg-white border-slate-200"
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isFlashActive ? "bg-amber-400 animate-pulse" : "bg-slate-100"
        }`}>
          <Zap className={`w-5 h-5 ${isFlashActive ? "text-white" : "text-slate-400"}`} />
        </div>
        <div>
          <p className="font-bold text-slate-900">Mode Flash</p>
          <p className="text-xs text-slate-500">Disponible pour promenade immédiate</p>
        </div>
        {isFlashActive && timeLeft && (
          <span className="ml-auto text-xs font-mono bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
            ⏱ {timeLeft}
          </span>
        )}
      </div>

      {/* Description */}
      {!isFlashActive && (
        <p className="text-xs text-slate-500">
          Activez ce mode pour apparaître sur la carte avec une icône ⚡ et alerter les propriétaires proches (2 km). Valide 2 heures.
        </p>
      )}

      {/* Message field */}
      {!isFlashActive && (
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Message (optionnel)</label>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Disponible dès maintenant près de Tel Aviv !"
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
      )}

      {/* Active info */}
      {isFlashActive && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100/60 rounded-xl px-3 py-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>Votre profil est mis en avant sur la carte pour les propriétaires à moins de 2 km.</span>
        </div>
      )}

      {/* Toggle button */}
      <Button
        onClick={isFlashActive ? deactivate : activate}
        disabled={toggling}
        className={`w-full rounded-xl h-11 gap-2 font-semibold ${
          isFlashActive
            ? "bg-slate-700 hover:bg-slate-800 text-white"
            : "bg-amber-400 hover:bg-amber-500 text-white shadow-md shadow-amber-200"
        }`}
      >
        {toggling
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : isFlashActive
            ? <><ZapOff className="w-4 h-4" /> Désactiver le mode Flash</>
            : <><Zap className="w-4 h-4" /> Activer le mode Flash ⚡</>
        }
      </Button>
    </div>
  );
}