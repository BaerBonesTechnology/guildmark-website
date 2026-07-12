/** PDP media gallery: main image with badges + thumbnail strip. */
import { ShieldCheck } from "lucide-react";
import { CONDITION_LABEL, GRADE_COLOR } from "../../constants/marketplace.constants";
import { MONO } from "../../constants/typography";

interface ProductGalleryProps {
  grade?: string | null;
  imageIndex: number;
  images: string[];
  modelName: string;
  onSelectImage: (index: number) => void;
  placeholderIcon: React.ElementType;
}

export function ProductGallery({ grade, imageIndex, images, modelName, onSelectImage, placeholderIcon: Icon }: ProductGalleryProps) {
  return (
    <>
      <div className="border border-border h-[360px] relative flex items-center justify-center overflow-hidden" style={{ background: "var(--secondary)" }}>
        {images.length > 0
          ? <img src={images[Math.min(imageIndex, images.length - 1)]} alt={modelName} className="w-full h-full object-cover" />
          : <Icon size={64} className="opacity-25" style={{ color: "var(--muted-foreground)" }} />}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {grade && (
            <span className="text-[10px] px-2 py-0.5" style={{ color: GRADE_COLOR[grade], border: `1px solid color-mix(in srgb, ${GRADE_COLOR[grade]} 30%, transparent)`, background: "rgba(0,0,0,0.4)", fontFamily: MONO }}>
              {CONDITION_LABEL[grade]}
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 flex items-center gap-1" style={{ color: "#fff", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)", background: "var(--primary)", fontFamily: MONO }}>
            <ShieldCheck size={10} /> CERTIFIED
          </span>
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((src, ndx) => (
            <button key={ndx} onClick={() => onSelectImage(ndx)}
              className="w-16 h-16 border overflow-hidden transition-colors"
              style={{ borderColor: ndx === imageIndex ? "var(--primary)" : "var(--border)" }}>
              <img src={src} alt={`${modelName} ${ndx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
