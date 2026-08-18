import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailablePages } from "@/hooks/useSocialMediaIntegrations";
import {
  SOCIAL_PLATFORMS,
  type SocialPlatformKey,
} from "@/config/socialPlatforms";
import {
  usePostToSocialMedia,
  useBatchPostToSocialMedia,
} from "@/hooks/useSocialMediaPosting";
import {
  Send,
  Loader2,
  Hash,
  Link2,
  Monitor,
  Copy,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Users,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Clock,
  Film,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PostLivePreview } from "./PostLivePreview";
import { MediaFrame } from "./MediaFrame";
import { MediaLightbox } from "./MediaLightbox";

const POST_FORMATS = [
  {
    value: "feed" as const,
    label: "Feed",
    icon: Newspaper,
    hint: "A standard post on the timeline",
  },
  {
    value: "story" as const,
    label: "Story",
    icon: Clock,
    hint: "One image or video, disappears after 24 hours",
  },
  {
    value: "reel" as const,
    label: "Reel",
    icon: Film,
    hint: "A short vertical video, 3–90 seconds",
  },
];

const FORMATS_WITHOUT_CAROUSEL = ["story", "reel"];

const postSchema = z
  .object({
    mode: z.enum(["manual", "batch"], {
      errorMap: () => ({ message: "Select a mode" }),
    }),
    platform: z.enum([...SOCIAL_PLATFORMS] as const, {
      errorMap: () => ({ message: "Select a platform" }),
    }),
    pageId: z.string().min(1, "Please select an account"),
    format: z.enum(["feed", "story", "reel"]).default("feed"),
    message: z.string().max(63206).optional(),
    link: z.string().url("Invalid URL").optional().or(z.literal("")),
    description: z.string().max(4000).optional(),
    caption: z.string().max(1000).optional(),
    tags: z.string().optional(),
    imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
    videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
    altText: z.string().max(500).optional(),
    scheduleTime: z.string().optional(),
    aiGenerated: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.format === "feed" && !data.message?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message: "Message is required",
      });
    }

    if (data.format === "reel" && !data.videoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["videoUrl"],
        message: "A reel needs a video",
      });
    }

    if (data.format === "story" && !data.videoUrl && !data.imageUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imageUrl"],
        message: "A story needs an image or a video",
      });
    }
  });

type PostFormData = z.infer<typeof postSchema>;

interface BatchPost {
  id: string;
  platform: string;
  account: string;
  message: string;
  payload: Record<string, unknown>;
  imageCount: number;
}

const SocialMediaPostForm = () => {
  const postMutation = usePostToSocialMedia();
  const batchMutation = useBatchPostToSocialMedia();
  const [selectedMode, setSelectedMode] = useState<"manual" | "batch">(
    "manual",
  );
  const [batchQueue, setBatchQueue] = useState<BatchPost[]>([]);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      mode: "manual",
      platform: undefined,
      pageId: "",
      format: "feed",
      message: "",
      link: "",
      description: "",
      caption: "",
      tags: "",
      imageUrl: "",
      videoUrl: "",
      altText: "",
      scheduleTime: "",
      aiGenerated: false,
    },
  });

  // Watch platform selection
  const currentPlatform = form.watch("platform");
  const currentFormat = form.watch("format");
  const supportsCarousel = !FORMATS_WITHOUT_CAROUSEL.includes(currentFormat);
  const singleImageUrl = form.watch("imageUrl");
  const previewImages =
    carouselImages.length > 0
      ? carouselImages
      : singleImageUrl
        ? [singleImageUrl]
        : [];

  // Fetch available pages/accounts for selected platform
  const { data: pagesData, isLoading: pagesLoading } =
    useAvailablePages(currentPlatform);

  const availableAccounts = pagesData?.connected || [];

  // Get selected account details for preview
  const selectedAccount = availableAccounts.find(
    (account) => account.id === form.watch("pageId"),
  );

  const buildPayload = (data: PostFormData) => {
    const tags = data.tags
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const singleMediaFormat = FORMATS_WITHOUT_CAROUSEL.includes(data.format);

    const mediaUrls = data.videoUrl
      ? [data.videoUrl]
      : singleMediaFormat
        ? data.imageUrl
          ? [data.imageUrl]
          : carouselImages.slice(0, 1)
        : carouselImages.length > 0
          ? carouselImages
          : data.imageUrl
            ? [data.imageUrl]
            : [];

    const mediaType = data.videoUrl
      ? "video"
      : mediaUrls.length > 1
        ? "carousel"
        : "image";

    return {
      platform: data.platform,
      pageId: data.pageId,
      format: data.format,
      content: {
        message: data.message,
        link: data.link || undefined,
        description: data.description || undefined,
        caption: data.caption || undefined,
        tags,
      },
      media:
        mediaUrls.length > 0
          ? {
              type: mediaType as "carousel" | "image" | "video",
              urls: mediaUrls,
              url: mediaUrls[0],
              alt_text: data.altText,
            }
          : undefined,
      scheduling: data.scheduleTime
        ? {
            scheduled_publish_time: Math.floor(
              new Date(data.scheduleTime).getTime() / 1000,
            ),
          }
        : { publish_immediately: true },
      metadata: {
        aiGenerated: data.aiGenerated,
        generatedBy: data.aiGenerated ? "ai-generator" : "manual",
        timestamp: new Date().toISOString(),
      },
    };
  };

  const onSubmit = async (data: PostFormData) => {
    const payload = buildPayload(data);

    try {
      if (data.mode === "manual") {
        await postMutation.mutateAsync(payload);
        form.reset();
        setCarouselImages([]);
        setCurrentImageIdx(0);
        setNewImageUrl("");
      } else {
        // Batch mode: store full payload with images
        const newPost: BatchPost = {
          id: Math.random().toString(36).substr(2, 9),
          platform: data.platform,
          account: data.pageId,
          message: data.message,
          payload: payload, // Store complete payload with images
          imageCount: carouselImages.length,
        };
        setBatchQueue([...batchQueue, newPost]);
        form.reset({
          ...form.getValues(),
          platform: data.platform,
          pageId: data.pageId,
        });
        setCarouselImages([]);
        setCurrentImageIdx(0);
        setNewImageUrl("");
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to add post to queue";
      console.error("Post submission error:", errorMsg);
      alert(`Error: ${errorMsg}`);
    }
  };

  const submitBatchQueue = async () => {
    if (batchQueue.length === 0) return;

    // Extract payloads from batch queue (already have images baked in)
    const payloads = batchQueue.map((post) => post.payload);

    try {
      await batchMutation.mutateAsync(
        payloads as unknown as Record<string, unknown>,
      );
      setBatchQueue([]);
      form.reset();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to submit batch";
      console.error("Batch submission error:", errorMsg);
      alert(`Error: ${errorMsg}`);
    }
  };

  const removeBatchPost = (id: string) => {
    setBatchQueue(batchQueue.filter((post) => post.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let loadedCount = 0;
    const newImages: string[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        newImages.push(base64);
        loadedCount++;

        if (loadedCount === files.length) {
          setCarouselImages([...carouselImages, ...newImages]);
          e.target.value = "";
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const reorderImages = (fromIdx: number, toIdx: number) => {
    const newImages = [...carouselImages];
    const [removed] = newImages.splice(fromIdx, 1);
    newImages.splice(toIdx, 0, removed);
    setCarouselImages(newImages);
    if (currentImageIdx === fromIdx) {
      setCurrentImageIdx(toIdx);
    }
  };

  return (
    <Card className="border-border/50 overflow-hidden shadow-lg">
      <div className="h-1 bg-primary" />
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Send className="w-4 h-4 text-primary" />
          </div>
          Post to Social Media
        </CardTitle>
        <CardDescription>
          Post content manually or in batch to any platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,78fr)_minmax(0,22fr)]">
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Mode Selection */}
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                        Posting Mode
                      </FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "manual", label: "Single Post", icon: Send },
                          { value: "batch", label: "Batch Posts", icon: Copy },
                        ].map((mode) => (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() => {
                              field.onChange(mode.value);
                              setSelectedMode(mode.value as "manual" | "batch");
                            }}
                            className={cn(
                              "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                              selectedMode === mode.value
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-border bg-muted/20",
                            )}
                          >
                            <mode.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {mode.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Platform Selection */}
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                        Platform *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-muted/30 border-border/50 focus:ring-primary">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover">
                          {[
                            "facebook",
                            "instagram",
                            "twitter",
                            "linkedin",
                            "tiktok",
                          ].map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform.charAt(0).toUpperCase() +
                                platform.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Post Format */}
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Film className="w-3.5 h-3.5 text-muted-foreground" />
                        Post Format
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {POST_FORMATS.map((format) => (
                          <button
                            key={format.value}
                            type="button"
                            onClick={() => field.onChange(format.value)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200",
                              field.value === format.value
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-border bg-muted/20",
                            )}
                          >
                            <format.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {format.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      <FormDescription className="text-xs">
                        {
                          POST_FORMATS.find(
                            (entry) => entry.value === field.value,
                          )?.hint
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Account Selection */}
                <FormField
                  control={form.control}
                  name="pageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        Account *
                      </FormLabel>
                      {currentPlatform ? (
                        pagesLoading ? (
                          <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading accounts...
                          </div>
                        ) : availableAccounts.length > 0 ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-muted/30 border-border/50">
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-popover">
                              {availableAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-200">
                            No connected accounts for this platform. Please
                            connect an account first.
                          </div>
                        )
                      ) : (
                        <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                          Select a platform first
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Send className="w-3.5 h-3.5 text-primary" />
                        Message {currentFormat === "feed" ? "*" : "(optional)"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your post message..."
                          className="min-h-24 bg-muted/30 border-border/50 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {field.value?.length ?? 0}/63206 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Link */}
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                        Link
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          className="h-11 bg-muted/30 border-border/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        Tags / Hashtags
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tag1, tag2, tag3"
                          className="h-11 bg-muted/30 border-border/50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Comma-separated tags
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Video */}
                {currentFormat !== "feed" && (
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-muted-foreground" />
                          Video URL {currentFormat === "reel" ? "*" : ""}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://cdn.example.com/clip.mp4"
                            className="h-11 bg-muted/30 border-border/50"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {currentFormat === "reel"
                            ? "9:16, 3–90 seconds, hosted on a public https URL"
                            : "Leave empty to publish an image story instead"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Carousel Images */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {supportsCarousel ? "Media (Single or Carousel)" : "Image"}
                  </label>

                  {!supportsCarousel && (
                    <p className="text-xs text-muted-foreground">
                      A {currentFormat} takes one piece of media. Only the first
                      image is used.
                    </p>
                  )}

                  {carouselImages.length > 0 ? (
                    <div className="space-y-3">
                      {/* Carousel Preview */}
                      <MediaFrame
                        src={carouselImages[currentImageIdx]}
                        alt={`Slide ${currentImageIdx + 1}`}
                        className="h-80"
                        onExpand={() => setLightboxOpen(true)}
                      >
                        {carouselImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentImageIdx(
                                  currentImageIdx === 0
                                    ? carouselImages.length - 1
                                    : currentImageIdx - 1,
                                )
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentImageIdx(
                                  currentImageIdx === carouselImages.length - 1
                                    ? 0
                                    : currentImageIdx + 1,
                                )
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {carouselImages.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setCurrentImageIdx(idx)}
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    idx === currentImageIdx
                                      ? "bg-white"
                                      : "bg-white/50",
                                  )}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </MediaFrame>

                      {/* Images List with Reordering */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {carouselImages.map((url, idx) => (
                          <div
                            key={`${idx}-${url.slice(0, 20)}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData(
                                "text/plain",
                                idx.toString(),
                              );
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const fromIdx = parseInt(
                                e.dataTransfer.getData("text/plain"),
                                10,
                              );
                              if (fromIdx !== idx) {
                                reorderImages(fromIdx, idx);
                              }
                            }}
                            className="relative flex-shrink-0 group"
                          >
                            <img
                              src={url}
                              alt={`Slide ${idx + 1}`}
                              className={cn(
                                "w-16 h-16 object-cover rounded-md cursor-grab active:cursor-grabbing border-2 transition-all",
                                idx === currentImageIdx
                                  ? "border-primary shadow-lg"
                                  : "border-border/50 hover:border-border group-hover:shadow-md",
                              )}
                              onClick={() => setCurrentImageIdx(idx)}
                            />
                            <div className="absolute inset-0 rounded-md bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-xs font-medium">
                                {idx + 1}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setCarouselImages(
                                  carouselImages.filter((_, i) => i !== idx),
                                )
                              }
                              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add More Images */}
                      <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Add more slides
                        </p>
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            placeholder="Add another image URL..."
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="h-10 bg-muted/30 border-border/50 text-sm flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (newImageUrl) {
                                setCarouselImages([
                                  ...carouselImages,
                                  newImageUrl,
                                ]);
                                setNewImageUrl("");
                              }
                            }}
                            className="px-3"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <label className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 cursor-pointer transition-colors">
                          <ImageIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Upload image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            multiple
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          From URL
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="h-11 bg-muted/30 border-border/50 flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (newImageUrl) {
                                setCarouselImages([newImageUrl]);
                                setNewImageUrl("");
                              }
                            }}
                            className="px-4"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-border/50" />
                          <span className="text-xs text-muted-foreground px-2">
                            OR
                          </span>
                          <div className="flex-1 h-px bg-border/50" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          Upload File
                        </label>
                        <label className="flex items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 cursor-pointer transition-colors">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            multiple
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <FormField
                  control={form.control}
                  name="scheduleTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        Schedule (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="h-11 bg-muted/30 border-border/50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Leave empty to post immediately
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* AI Generated Badge */}
                <FormField
                  control={form.control}
                  name="aiGenerated"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <FormLabel className="cursor-pointer">
                          AI Generated Content
                        </FormLabel>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                {selectedMode === "batch" ? (
                  <Button
                    type="submit"
                    variant="default"
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={postMutation.isPending || batchMutation.isPending}
                  >
                    {postMutation.isPending || batchMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Add to Queue
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="default"
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={postMutation.isPending || batchMutation.isPending}
                  >
                    {postMutation.isPending || batchMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Post to {form.watch("platform") || "Social Media"}
                      </>
                    )}
                  </Button>
                )}
              </form>
            </Form>

            {/* Batch Queue Display */}
            {selectedMode === "batch" && batchQueue.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    Queue ({batchQueue.length} posts)
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Ready to send {batchQueue.length} post
                    {batchQueue.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {batchQueue.map((post, idx) => (
                    <div
                      key={post.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Post {idx + 1}
                          </p>
                          {post.imageCount > 0 && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              {post.imageCount}{" "}
                              {post.imageCount === 1 ? "image" : "images"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm line-clamp-2">{post.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBatchPost(post.id)}
                        className="text-destructive hover:text-destructive/80 text-xs font-medium flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={submitBatchQueue}
                  variant="default"
                  className="w-full h-11 font-semibold"
                  disabled={batchQueue.length === 0 || batchMutation.isPending}
                >
                  {batchMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Batch ({batchQueue.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <PostLivePreview
                platform={currentPlatform}
                format={currentFormat}
                accountName={selectedAccount?.name}
                accountAvatar={selectedAccount?.picture?.data?.url}
                message={form.watch("message")}
                link={form.watch("link")}
                tags={form.watch("tags")}
                images={previewImages}
                currentIndex={currentImageIdx}
                onExpandImage={() => setLightboxOpen(true)}
                onIndexChange={setCurrentImageIdx}
                videoUrl={form.watch("videoUrl")}
                scheduleTime={form.watch("scheduleTime")}
                aiGenerated={form.watch("aiGenerated")}
              />
            </div>
          </aside>
        </div>
      </CardContent>

      <MediaLightbox
        images={previewImages}
        index={currentImageIdx}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setCurrentImageIdx}
      />
    </Card>
  );
};

export default SocialMediaPostForm;
