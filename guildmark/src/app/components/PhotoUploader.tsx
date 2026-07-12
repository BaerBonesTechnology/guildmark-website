import { AlertCircle, Loader2, UploadCloud, X } from "lucide-react";
import { IMAGE_ACCEPT_ATTR, MAX_IMAGES_PER_LISTING } from "../constants/productImage.constants";
import { usePhotoUploadViewModel } from "../viewmodels/usePhotoUploadViewModel";

interface PhotoUploaderProps {
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

/**
 * Drag-and-drop (or click-to-select) uploader for listing photos. Uploads each
 * image to the product-images bucket via the API and reports the committed URLs
 * through `onChange`. Presentational — all logic lives in the ViewModel.
 */
export function PhotoUploader({ onChange, maxImages = MAX_IMAGES_PER_LISTING }: PhotoUploaderProps) {
  const vm = usePhotoUploadViewModel({ onChange, maxImages });

  return (
    <div className="space-y-3">
      <div
        onDragOver={vm.handleDragOver}
        onDragLeave={vm.handleDragLeave}
        onDrop={vm.handleDrop}
        onClick={vm.canAddMore ? vm.openFilePicker : undefined}
        role="button"
        tabIndex={0}
        className={[
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          vm.isDragging ? "border-primary bg-primary/5" : "border-input",
          vm.canAddMore ? "cursor-pointer hover:bg-muted/50" : "cursor-not-allowed opacity-60",
        ].join(" ")}
      >
        <UploadCloud className="w-6 h-6 text-muted-foreground" />
        <p className="text-sm">
          <span className="font-semibold text-primary">Click to upload</span> or drag &amp; drop
        </p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or GIF — up to {maxImages} images (first is the cover)
        </p>
        <input
          ref={vm.fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT_ATTR}
          multiple
          onChange={vm.handleInputChange}
          className="hidden"
        />
      </div>

      {vm.items.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {vm.items.map((item, ndx) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-md border border-input bg-muted"
            >
              {item.previewUrl ? (
                <img src={item.previewUrl} alt={item.fileName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}

              {item.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              )}

              {item.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-1 text-center">
                  <span className="text-[10px] leading-tight text-red-200">{item.error}</span>
                </div>
              )}

              {item.status === "done" && ndx === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Cover
                </span>
              )}

              <button
                type="button"
                onClick={() => vm.removeImage(item.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
