const VIDEO_EXTENSION = /\.(mp4|mov|webm|m4v)(\?|#|$)/i;
const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i;

export const isVideoUrl = (url: string, mediaType?: string | null) =>
  VIDEO_EXTENSION.test(url) ||
  (mediaType === "video" && !IMAGE_EXTENSION.test(url));
