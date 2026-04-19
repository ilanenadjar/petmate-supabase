/**
 * WalkTrackerPanel — Pet-sitter side
 * Records GPS position every 10 seconds and writes breadcrumbs to WalkSession entity.
 */
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Play, Square, Copy, Check, Navigation } from "lucide-react";
import { calcTotalDistance, formatDuration, generateShareToken, geofenceCheck } from "@/lib/gpsUtils";

const INTERVAL_MS = 10_000; // 10 seconds

export default function WalkTrackerPanel({ session, onSessionUpdate }) {
  const [status, setStatus] = useState(session?.status || "waiting"); // waiting | active | completed
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(session?.total_distance_km || 0);
  const [gpsError, setGpsError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
  const [checkinError, setCheckinError] = useState(null);
  const [checkinLoading, setCheckinLoading] = useState(false);

  const intervalRef = useRef(null);
  const elapsedRef = useRef(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Elapsed timer
  useEffect(() => {
    if (status === "active") {
      elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(elapsedRef.current);
    }
    return () => clearInterval(elapsedRef.current);
  }, [status]);

  // GPS recording loop
  useEffect(() => {
    if (status !== "active") {
      clearInterval(intervalRef.current);
      return;
    }

    const record = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newPoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ts: new Date().toISOString(),
          };
          setCurrentPos(newPoint);
          setGpsError(null);

          const existing = sessionRef.current;
          const updatedPoints = [...(existing?.gps_points || []), newPoint];
          const totalDist = calcTotalDistance(updatedPoints);
          setDistance(totalDist);

          const updated = await base44.entities.WalkSession.update(existing.id, {
            gps_points: updatedPoints,
            total_distance_km: totalDist,
          });
          onSessionUpdate?.(updated);
        },
        (err) => setGpsError(err.message),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };

    record(); // immediate first point
    intervalRef.current = setInterval(record, INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const startWalk = async () => {
    setCheckinError(null);
    setCheckinLoading(true);

    // If owner coordinates are stored, validate geofence first
    if (session?.owner_lat != null && session?.owner_lng != null) {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      }).catch(() => null);

      if (!pos) {
        setCheckinError("Impossible d'obtenir votre position GPS. Vérifiez les permissions et réessayez.");
        setCheckinLoading(false);
        return;
      }

      const result = geofenceCheck(
        pos.coords.latitude,
        pos.coords.longitude,
        session.owner_lat,
        session.owner_lng
      );

      if (!result.ok) {
        setCheckinError(result.error);
        setCheckinLoading(false);
        return;
      }

      // Check-in validated — record timestamp and distance
      const now = new Date().toISOString();
      const updated = await base44.entities.WalkSession.update(session.id, {
        status: "active",
        started_at: now,
        checkin_at: now,
        checkin_distance_m: result.distanceM,
      });
      onSessionUpdate?.(updated);
      setStatus("active");
      setElapsed(0);
      setCheckinLoading(false);
      return;
    }

    // No geofence configured — start directly
    const updated = await base44.entities.WalkSession.update(session.id, {
      status: "active",
      started_at: new Date().toISOString(),
    });
    onSessionUpdate?.(updated);
    setStatus("active");
    setElapsed(0);
    setCheckinLoading(false);
  };

  const stopWalk = async () => {
    clearInterval(intervalRef.current);
    const updated = await base44.entities.WalkSession.update(session.id, {
      status: "completed",
      ended_at: new Date().toISOString(),
    });
    onSessionUpdate?.(updated);
    setStatus("completed");
  };

  const shareUrl = `${window.location.origin}/LiveTracking?token=${session?.share_token}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status === "active" ? "bg-green-500 animate-pulse" : status === "completed" ? "bg-slate-400" : "bg-amber-400"}`} />
          <span className="font-semibold text-slate-800">
            {status === "active" ? "Walk in progress" : status === "completed" ? "Walk completed" : "Ready to start"}
          </span>
        </div>
        <Badge variant="outline" className="text-slate-500 text-xs">
          {session?.pet_name || "Pet"}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 font-mono">{formatDuration(elapsed)}</p>
          <p className="text-xs text-slate-500 mt-1">Duration</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{distance.toFixed(2)}</p>
          <p className="text-xs text-orange-400 mt-1">km walked</p>
        </div>
      </div>

      {/* GPS status */}
      {currentPos && status === "active" && (
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
          <Navigation className="w-3.5 h-3.5 text-green-500" />
          <span>GPS: {currentPos.lat.toFixed(5)}, {currentPos.lng.toFixed(5)}</span>
          <span className="ml-auto text-slate-400">{session?.gps_points?.length || 0} pts</span>
        </div>
      )}
      {gpsError && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">⚠ GPS: {gpsError}</p>
      )}

      {/* Geofence check-in error */}
      {checkinError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <span className="text-lg leading-none">📍</span>
          <span>{checkinError}</span>
        </div>
      )}

      {/* Check-in validated badge */}
      {status === "active" && session?.checkin_at && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-xs text-green-700">
          <span>✅</span>
          <span>Check-in validé à {session.checkin_distance_m ?? "—"} m · {new Date(session.checkin_at).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Control buttons */}
      <div className="flex gap-3">
        {status === "waiting" && (
          <Button
            onClick={startWalk}
            disabled={checkinLoading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl h-12 gap-2"
          >
            {checkinLoading
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Vérification...</>
              : <><Play className="w-4 h-4 fill-white" /> Démarrer la visite</>
            }
          </Button>
        )}
        {status === "active" && (
          <Button
            onClick={stopWalk}
            variant="destructive"
            className="flex-1 rounded-xl h-12 gap-2"
          >
            <Square className="w-4 h-4 fill-white" /> End Walk
          </Button>
        )}
        {status === "completed" && (
          <div className="flex-1 bg-slate-100 rounded-xl h-12 flex items-center justify-center text-slate-500 text-sm gap-2">
            <MapPin className="w-4 h-4" />
            Session ended · {distance.toFixed(2)} km total
          </div>
        )}
      </div>

      {/* Share link for owner */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500 mb-2 font-medium">Share live view with owner</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600 truncate font-mono">
            {shareUrl}
          </div>
          <Button size="icon" variant="outline" onClick={copyLink} className="rounded-lg shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}