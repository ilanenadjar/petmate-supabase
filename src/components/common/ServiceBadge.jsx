import { Badge } from "@/components/ui/badge";
import { Footprints, Home, Sun, Moon } from "lucide-react";

const serviceConfig = {
  walking: { label: "Promenade", icon: Footprints, color: "bg-green-100 text-green-700 border-green-200" },
  sitting: { label: "Garde", icon: Home, color: "bg-blue-100 text-blue-700 border-blue-200" },
  boarding: { label: "Pension", icon: Moon, color: "bg-purple-100 text-purple-700 border-purple-200" },
  daycare: { label: "Journée", icon: Sun, color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function ServiceBadge({ serviceType }) {
  const config = serviceConfig[serviceType] || serviceConfig.walking;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border font-medium text-xs px-2.5 py-0.5 flex items-center gap-1 w-fit`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}