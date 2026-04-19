/**
 * NewSessionForm — Create a new walk session before starting.
 * Collects pet name, owner email and owner address coordinates for geofence check-in.
 */
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateShareToken } from "@/lib/gpsUtils";
import { PawPrint, Loader2, MapPin } from "lucide-react";

export default function NewSessionForm({ user, onCreated }) {
  const [petName, setPetName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerLat, setOwnerLat] = useState("");
  const [ownerLng, setOwnerLng] = useState("");
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  const detectOwnerLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOwnerLat(pos.coords.latitude.toFixed(6));
        setOwnerLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const create = async () => {
    setLoading(true);
    const session = await base44.entities.WalkSession.create({
      sitter_email: user.email,
      owner_email: ownerEmail || undefined,
      pet_name: petName || "My pet",
      status: "waiting",
      gps_points: [],
      total_distance_km: 0,
      share_token: generateShareToken(),
      owner_lat: ownerLat ? parseFloat(ownerLat) : undefined,
      owner_lng: ownerLng ? parseFloat(ownerLng) : undefined,
    });
    onCreated(session);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
          <PawPrint className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">New Walk Session</h2>
          <p className="text-xs text-slate-500">GPS tracking every 10 seconds</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Pet name</label>
          <Input
            placeholder="e.g. Max"
            value={petName}
            onChange={e => setPetName(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Owner email (optional)</label>
          <Input
            placeholder="owner@example.com"
            value={ownerEmail}
            onChange={e => setOwnerEmail(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {/* Owner address coordinates for geofence */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-blue-700">Adresse du propriétaire (géofencing)</span>
          </div>
          <p className="text-xs text-blue-600">
            Ces coordonnées servent à valider que le sitter est bien sur place avant de démarrer (rayon 100 m).
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Latitude</label>
              <Input
                placeholder="32.085300"
                value={ownerLat}
                onChange={e => setOwnerLat(e.target.value)}
                className="rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Longitude</label>
              <Input
                placeholder="34.781769"
                value={ownerLng}
                onChange={e => setOwnerLng(e.target.value)}
                className="rounded-xl text-sm"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locating}
            onClick={detectOwnerLocation}
            className="w-full rounded-xl text-xs gap-2 border-blue-200 text-blue-600 hover:bg-blue-100"
          >
            {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
            Utiliser ma position actuelle comme adresse
          </Button>
        </div>
      </div>

      <Button
        onClick={create}
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-xl h-11 gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PawPrint className="w-4 h-4" />}
        Create Session
      </Button>
    </div>
  );
}