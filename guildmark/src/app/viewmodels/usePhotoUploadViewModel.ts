/** ViewModel for the listing photo uploader: drag-and-drop + per-file upload
 *  state, feeding committed image URLs back to the form. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useUploadProductImage } from "../lib/apiHooks";
import { MAX_IMAGES_PER_LISTING } from "../constants/productImage.constants";
import { validateImageFile } from "../services/productImageUpload.service";

/** One image in the uploader — either uploading, uploaded, or failed. */
export interface PhotoUploadItem {
  id: string;
  fileName: string;
  previewUrl: string; // object URL for the local preview ("" when invalid)
  status: "uploading" | "done" | "error";
  url?: string; // remote view URL, once uploaded
  error?: string;
}

interface PhotoUploadOptions {
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function usePhotoUploadViewModel({
  onChange,
  maxImages = MAX_IMAGES_PER_LISTING,
}: PhotoUploadOptions) {
  const upload = useUploadProductImage();

  const [items, setItems] = useState<PhotoUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep the latest onChange without re-subscribing the emit effect.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Derived
  const canAddMore = items.length < maxImages;

  // Effects — re-emit the committed URLs whenever the item set changes.
  useEffect(() => {
    onChangeRef.current(
      items
        .filter((item) => item.status === "done" && item.url)
        .map((item) => item.url!),
    );
  }, [items]);

  // Revoke every object URL on unmount so previews don't leak.
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const accepted = Array.from(fileList).slice(
        0,
        Math.max(0, maxImages - itemsRef.current.length),
      );
      const added: PhotoUploadItem[] = accepted.map((file) => {
        const error = validateImageFile(file);
        return {
          id: crypto.randomUUID(),
          fileName: file.name,
          previewUrl: error ? "" : URL.createObjectURL(file),
          status: error ? "error" : "uploading",
          error,
        };
      });
      itemsRef.current = [...itemsRef.current, ...added];
      setItems((previous) => [...previous, ...added]);
      // Per-call mutate callbacks can be replaced by a subsequent upload. Each
      // promise owns its result, so selecting multiple files always settles all.
      added.forEach((item, index) => {
        if (item.status === "error") return;
        upload.mutateAsync(accepted[index]).then(
          (result) => patchItem(item.id, { status: "done", url: result.url }),
          () =>
            patchItem(item.id, {
              status: "error",
              error: "Upload failed. Remove this photo and try again.",
            }),
        );
      });
    },
    [maxImages, upload],
  );

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    if (canAddMore) setIsDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer?.files?.length) addFiles(event.dataTransfer.files);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) addFiles(event.target.files);
    event.target.value = ""; // allow re-selecting the same file
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function patchItem(id: string, patch: Partial<PhotoUploadItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeImage(id: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  return {
    canAddMore,
    fileInputRef,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleInputChange,
    isDragging,
    items,
    openFilePicker,
    removeImage,
  };
}
