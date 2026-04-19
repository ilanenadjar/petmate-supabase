import { Dog, Cat, Bird, Rabbit, PawPrint } from "lucide-react";

const icons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  other: PawPrint,
};

const colors = {
  dog: "text-amber-600 bg-amber-50",
  cat: "text-purple-600 bg-purple-50",
  bird: "text-sky-600 bg-sky-50",
  rabbit: "text-pink-600 bg-pink-50",
  other: "text-emerald-600 bg-emerald-50",
};

export default function PetTypeIcon({ petType, size = "md" }) {
  const Icon = icons[petType] || PawPrint;
  const colorClass = colors[petType] || colors.other;
  const sizeClass = size === "lg" ? "w-12 h-12 p-2.5" : size === "sm" ? "w-7 h-7 p-1" : "w-9 h-9 p-1.5";

  return (
    <div className={`${colorClass} ${sizeClass} rounded-xl flex items-center justify-center`}>
      <Icon className="w-full h-full" />
    </div>
  );
}