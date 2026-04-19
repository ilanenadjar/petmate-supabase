import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, X, ImagePlus } from "lucide-react";
import { useLang } from "../i18n/LanguageContext";

export default function MultiPhotoUpload({ photos = [], onChange }) {
  const { t } = useLang();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = await Promise.all(
      files.map(file => base44.integrations.Core.UploadFile({ file }).then(r => r.file_url))
    );
    onChange([...photos, ...urls]);
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (idx) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      {/* Existing photos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
              {idx === 0 && (
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs rounded px-1.5 py-0.5">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer h-28 ${
        uploading ? "border-orange-300 bg-orange-50" : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/50"
      }`}>
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <span className="text-sm text-orange-500">Téléchargement...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-slate-400" />
              <Upload className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-sm text-slate-500">
              {photos.length > 0 ? t("addMorePhotos") : t("addPhoto")}
            </span>
            <span className="text-xs text-slate-400">JPG, PNG — plusieurs fichiers acceptés</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}