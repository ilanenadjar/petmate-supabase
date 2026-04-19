import { Star } from "lucide-react";

export default function StarRating({ value, onChange, size = "md", readonly = false }) {
  const sizeClass = size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= value
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 fill-slate-100"
            }`}
          />
        </button>
      ))}
    </div>
  );
}