import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useTopics } from "@/hooks/useTopics";
import { useGenerateAIPost } from "@/hooks/useAIPosts";
import {
  Sparkles,
  Send,
  Loader2,
  Hash,
  Link2,
  Monitor,
  Zap,
  Facebook,
  Instagram,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  topic: z.string().min(1, "Please select a topic"),
  keywords: z.string().max(200).optional(),
  link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  platform: z.enum(["facebook", "instagram", "both"]),
  formMode: z.enum(["test", "production"]),
});

type FormData = z.infer<typeof formSchema>;

const CreatePostForm = () => {
  const { data: topics, isLoading: topicsLoading } = useTopics();
  const generatePost = useGenerateAIPost();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      keywords: "",
      link: "",
      platform: "both",
      formMode: "test",
    },
  });

  const onSubmit = async (data: FormData) => {
    await generatePost.mutateAsync({
      topic: data.topic,
      keywords: data.keywords || undefined,
      link: data.link || undefined,
      platform: data.platform,
      formMode: data.formMode,
    });
    form.reset();
  };

  const selectedPlatform = form.watch("platform");
  const selectedMode = form.watch("formMode");

  if (topicsLoading) {
    return (
      <Card className="border-border/50 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary-300 to-primary animate-shimmer bg-[length:200%_100%]" />
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            Generate AI Content
          </CardTitle>
          <CardDescription>
            Create AI-powered posts for Facebook & Instagram
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading topics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden shadow-lg">
      <div className="h-1 bg-primary" />
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          Generate AI Content
        </CardTitle>
        <CardDescription>
          Create AI-powered posts for Facebook & Instagram
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Topic *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-muted/30 border-border/50 focus:ring-primary">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover">
                      {topics?.map((topic) => (
                        <SelectItem key={topic.id} value={topic.name}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                    Keywords / Hashtags
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="#innovation #tech #africa"
                      className="h-11 bg-muted/30 border-border/50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Optional hashtags to include
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="https://example.com/article"
                      className="h-11 bg-muted/30 border-border/50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Optional URL to reference
                  </FormDescription>
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
                    Platform
                  </FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        value: "both",
                        label: "Both",
                        icon: () => (
                          <div className="flex -space-x-1">
                            <Facebook className="w-4 h-4 text-blue-500" />
                            <Instagram className="w-4 h-4 text-pink-500" />
                          </div>
                        ),
                      },
                      {
                        value: "facebook",
                        label: "Facebook",
                        icon: Facebook,
                        color: "text-blue-500",
                      },
                      {
                        value: "instagram",
                        label: "Instagram",
                        icon: Instagram,
                        color: "text-pink-500",
                      },
                    ].map((platform) => (
                      <button
                        key={platform.value}
                        type="button"
                        onClick={() => field.onChange(platform.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200",
                          selectedPlatform === platform.value
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-border bg-muted/20",
                        )}
                      >
                        <platform.icon
                          className={cn("w-5 h-5", platform.color)}
                        />
                        <span className="text-xs font-medium">
                          {platform.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mode Selection */}
            <FormField
              control={form.control}
              name="formMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange("test")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                        selectedMode === "test"
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-border/50 hover:border-border bg-muted/20",
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          selectedMode === "test"
                            ? "bg-amber-500"
                            : "bg-muted-foreground",
                        )}
                      />
                      <span className="text-sm font-medium">Test Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("production")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                        selectedMode === "production"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-border/50 hover:border-border bg-muted/20",
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          selectedMode === "production"
                            ? "bg-emerald-500"
                            : "bg-muted-foreground",
                        )}
                      />
                      <span className="text-sm font-medium">Production</span>
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="default"
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={generatePost.isPending}
            >
              {generatePost.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Generate & Post
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
