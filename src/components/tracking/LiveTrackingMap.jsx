/**
 * LiveTrackingMap — Owner view
 * Subscribes to WalkSession in real-time and displays GPS trail on a Leaflet map.
 */
import { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Route, Clock } from "lucide-react";
import { calcTotalDistance, formatDuration } from "@/lib/gpsUtils";

// Fix leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const dogIcon = L.divIcon({
  html: `<div style="background:linear-gradient(135deg,#f97316,#e11d48);width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🐕</div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const startIcon = L.divIcon({
  html: `<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Auto-pan to latest position
function AutoPan({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 0.8 });
  }, [position]);
  return null;
}

export default function LiveTrackingMap({ sessionId, token }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Load session initially
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let results;
      if (token) {
        results = await base44.entities.WalkSession.filter({ share_token: token }, "", 1);
      } else if (sessionId) {
        results = await base44.entities.WalkSession.filter({ id: sessionId }, "", 1);
      }
      if (results?.[0]) setSession(results[0]);
      setLoading(false);
    };
    load();
  }, [sessionId, token]);

  // Real-time subscription
  useEffect(() => {
    if (!session?.id) return;
    const unsub = base44.entities.WalkSession.subscribe((event) => {
      if (event.id === session.id) setSession(event.data);
    });
    return unsub;
  }, [session?.id]);

  // Elapsed timer from started_at
  useEffect(() => {
    if (session?.status === "active" && session?.started_at) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(session.started_at)) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      if (session?.started_at && session?.ended_at) {
        setElapsed(Math.floor((new Date(session.ended_at) - new Date(session.started_at)) / 1000));
      }
    }
    return () => clearInterval(timerRef.current);
  }, [session?.status]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Loading walk session…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
        <div className="text-center space-y-2">
          <p className="text-4xl">🐾</p>
          <p className="text-slate-600 font-semibold">Session not found</p>
          <p className="text-slate-400 text-sm">Check the link and try again.</p>
        </div>
      </div>
    );
  }

  const points = session.gps_points || [];
  const latLngs = points.map(p => [p.lat, p.lng]);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const totalDist = calcTotalDistance(points);
  const center = lastPoint
    ? [lastPoint.lat, lastPoint.lng]
    : firstPoint
    ? [firstPoint.lat, firstPoint.lng]
    : [31.5, 34.75]; // default Israel

  return (
    <div className="h-full flex flex-col gap-0 rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
      {/* Status bar */}
      <div className="bg-white px-5 py-3 flex items-center gap-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${session.status === "active" ? "bg-green-500 animate-pulse" : session.status === "completed" ? "bg-slate-400" : "bg-amber-400"}`} />
          <span className="text-sm font-semibold text-slate-700">
            {session.status === "active" ? "Live walk" : session.status === "completed" ? "Walk ended" : "Waiting to start"}
          </span>
          {session.pet_name && <Badge variant="outline" className="text-xs">{session.pet_name}</Badge>}
        </div>
        <div className="ml-auto flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Route className="w-4 h-4 text-orange-500" />
            <span className="font-semibold">{totalDist.toFixed(2)} km</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="font-mono">{formatDuration(elapsed)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Navigation className="w-4 h-4 text-slate-400" />
            <span className="text-xs">{points.length} GPS pts</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0">
        {points.length === 0 && session.status !== "active" ? (
          <div className="h-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Walk hasn't started yet</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            {/* GPS trail */}
            {latLngs.length > 1 && (
              <Polyline
                positions={latLngs}
                pathOptions={{ color: "#f97316", weight: 4, opacity: 0.85, lineCap: "round" }}
              />
            )}

            {/* Start marker */}
            {firstPoint && (
              <Marker position={[firstPoint.lat, firstPoint.lng]} icon={startIcon}>
                <Popup>Walk started here</Popup>
              </Marker>
            )}

            {/* Current position marker (dog icon) */}
            {lastPoint && session.status === "active" && (
              <Marker position={[lastPoint.lat, lastPoint.lng]} icon={dogIcon}>
                <Popup>
                  🐕 {session.pet_name || "Pet"} is here<br />
                  <span className="text-xs text-slate-500">Last update: {new Date(lastPoint.ts).toLocaleTimeString()}</span>
                </Popup>
              </Marker>
            )}

            {/* Auto-pan to latest */}
            {lastPoint && session.status === "active" && (
              <AutoPan position={[lastPoint.lat, lastPoint.lng]} />
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
}