import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoGallery({ photos = [] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!photos || photos.length === 0) return null;

  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent(i => (i + 1) % photos.length);

  return (
    <>
      {/* Main gallery */}
      <div className="relative h-72 md:h-96 bg-slate-100 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={photos[current]}
            alt={`Photo ${current + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setLightbox(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>

        {/* Zoom hint */}
        <button
          onClick={() => setLightbox(true)}
          className="absolute top-3 right-3 bg-black/40 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Nav arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </>
        )}

        {/* Dots */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${i === current ? "bg-white w-5 h-2" : "bg-white/50 w-2 h-2"}`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/40 text-white text-xs rounded-full px-2.5 py-1 backdrop-blur-sm">
            {current + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === current ? "border-orange-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white"
              onClick={() => setLightbox(false)}
            >
              <X className="w-8 h-8" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 rounded-full p-3"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 rounded-full p-3"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <motion.img
              key={current}
              src={photos[current]}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
            />
            {photos.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                {current + 1} / {photos.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}