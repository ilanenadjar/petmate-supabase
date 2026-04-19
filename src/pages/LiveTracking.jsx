/**
 * LiveTracking page
 * - ?token=xxx   → Owner view (no login required) — just the map
 * - (no token)   → Sitter view — create session / track walk
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import LiveTrackingMap from "../components/tracking/LiveTrackingMap";
import WalkTrackerPanel from "../components/tracking/WalkTrackerPanel";
import NewSessionForm from "../components/tracking/NewSessionForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, List, Plus, ChevronLeft } from "lucide-react";
import FlashModeToggle from "../components/flash/FlashModeToggle";
import { useQuery } from "@tanstack/react-query";
import { formatDuration, calcTotalDistance } from "@/lib/gpsUtils";
import { format } from "date-fns";

export default function LiveTracking() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const [user, setUser] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState("list"); // list | tracker | newSession

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Owner view via share token — no auth needed
  if (token) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <div className="h-14 bg-slate-800/80 backdrop-blur flex items-center px-5 gap-3 shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">PetMate · Live Walk</span>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs ml-auto animate-pulse">● Live</Badge>
        </div>
        <div className="flex-1 min-h-0 p-4">
          <LiveTrackingMap token={token} />
        </div>
      </div>
    );
  }

  // Sitter view — requires login
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-5xl">🐾</p>
          <p className="font-semibold text-slate-700">Sign in to track a walk</p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-500" /> Live GPS Tracking
            </h1>
            <p className="text-slate-500 text-sm mt-1">Track walks in real-time · GPS recorded every 10 s</p>
          </div>
          {view === "list" && (
            <Button
              onClick={() => setView("newSession")}
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl gap-2"
            >
              <Plus className="w-4 h-4" /> New Walk
            </Button>
          )}
          {view !== "list" && (
            <Button variant="ghost" className="rounded-xl gap-2 text-slate-600" onClick={() => { setView("list"); setActiveSession(null); }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
        </div>

        {/* New session form */}
        {view === "newSession" && (
          <div className="max-w-md mx-auto">
            <NewSessionForm user={user} onCreated={(s) => { setActiveSession(s); setView("tracker"); }} />
          </div>
        )}

        {/* Active tracker + map side by side */}
        {view === "tracker" && activeSession && (
          <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
            <div className="flex flex-col gap-4">
              <WalkTrackerPanel
                session={activeSession}
                onSessionUpdate={(s) => setActiveSession(s)}
              />
            </div>
            <div className="h-full min-h-[400px]">
              <LiveTrackingMap sessionId={activeSession.id} />
            </div>
          </div>
        )}

        {/* Flash mode toggle (visible in list view) */}
        {view === "list" && (
          <div className="mb-6 max-w-md">
            <FlashModeToggle user={user} />
          </div>
        )}

        {/* Sessions list */}
        {view === "list" && (
          <SessionsList userEmail={user.email} onSelect={(s) => { setActiveSession(s); setView("tracker"); }} />
        )}
      </div>
    </div>
  );
}

function SessionsList({ userEmail, onSelect }) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["walkSessions", userEmail],
    queryFn: () => base44.entities.WalkSession.filter({ sitter_email: userEmail }, "-created_date", 20),
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🐕</p>
        <h3 className="text-lg font-semibold text-slate-700">No walk sessions yet</h3>
        <p className="text-slate-400 text-sm mt-1">Start a new walk to begin live GPS tracking.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map(s => {
        const points = s.gps_points || [];
        const dist = s.total_distance_km ?? calcTotalDistance(points);
        const statusColor = {
          active: "bg-green-100 text-green-700",
          completed: "bg-slate-100 text-slate-600",
          waiting: "bg-amber-100 text-amber-700",
          cancelled: "bg-red-100 text-red-500",
        }[s.status] || "bg-slate-100 text-slate-500";

        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-orange-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                {s.pet_name || "Pet"}
              </span>
              <Badge className={`${statusColor} border-0 text-xs`}>{s.status}</Badge>
            </div>
            <div className="space-y-1 text-sm text-slate-500">
              <div className="flex justify-between">
                <span>Distance</span>
                <span className="font-semibold text-slate-700">{dist.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span>GPS points</span>
                <span className="font-semibold text-slate-700">{points.length}</span>
              </div>
              {s.started_at && (
                <div className="flex justify-between">
                  <span>Started</span>
                  <span className="text-xs">{format(new Date(s.started_at), "d MMM, HH:mm")}</span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}