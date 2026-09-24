import { useCallback, useEffect, useRef, useState } from "react";

export interface StagedPhoto {
  file: File;
  preview: string;
}

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ACCEPTED_PHOTO_TYPES = [...ACCEPTED_TYPES].join(",");

export function useStagedPhotos() {
  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const previews = useRef(new Set<string>());

  const add = useCallback((list: FileList | File[] | null) => {
    const files = Array.from(list ?? []).filter((file) =>
      ACCEPTED_TYPES.has(file.type),
    );
    if (files.length === 0) return 0;

    const next = files.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { file, preview };
    });
    setStaged((current) => [...current, ...next]);
    return files.length;
  }, []);

  const remove = useCallback((preview: string) => {
    URL.revokeObjectURL(preview);
    previews.current.delete(preview);
    setStaged((current) => current.filter((item) => item.preview !== preview));
  }, []);

  const clear = useCallback(() => {
    previews.current.forEach((preview) => URL.revokeObjectURL(preview));
    previews.current.clear();
    setStaged([]);
  }, []);

  useEffect(() => {
    const held = previews.current;
    return () => held.forEach((preview) => URL.revokeObjectURL(preview));
  }, []);

  return { staged, add, remove, clear };
}
