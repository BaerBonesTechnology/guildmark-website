import { CONDITION_LABEL } from "../../constants/marketplace.constants";

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
    <div className="gm-product-gallery">
      <div className="gm-product-image">
        {images.length > 0 ? <img src={images[Math.min(imageIndex, images.length - 1)]} alt={modelName} /> :
          <div className="gm-product-no-photo"><Icon size={94} strokeWidth={1} /><p>Product photo not provided</p><span>Review the specifications and condition details below.</span></div>}
        {grade && <span className="gm-condition">{CONDITION_LABEL[grade] ?? grade}</span>}
      </div>
      {images.length > 1 && <div className="gm-product-thumbnails" aria-label="Product photos">
        {images.map((src, index) => <button key={index} type="button" aria-label={`View photo ${index + 1}`} aria-pressed={index === imageIndex} onClick={() => onSelectImage(index)}><img src={src} alt="" /></button>)}
      </div>}
    </div>
  );
}
