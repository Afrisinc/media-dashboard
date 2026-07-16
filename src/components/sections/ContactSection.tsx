import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, Mail, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/services/notifyService";

const contactMeta = [
  {
    label: "Email",
    value: "hello@afrisinc.com",
    href: "mailto:hello@afrisinc.com",
    icon: Mail,
  },
  {
    label: "Global Presence",
    value: "Africa · Europe · Americas",
    href: null,
    icon: Globe,
  },
  // { label: "Phone",           value: "+1 (555) 123-4567",         href: "tel:+15551234567",          icon: Phone },
];

const socials = [
  { name: "Twitter", href: "#" },
  { name: "LinkedIn", href: "#" },
  { name: "YouTube", href: "#" },
  { name: "Instagram", href: "#" },
];

export const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-28 md:py-36 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 mb-16 pb-12 border-b border-border">
          <div>
            <p className="line-accent">Get In Touch</p>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.0]">
              We Read{" "}
              <span className="font-display italic text-gradient-primary">
                Every Message.
              </span>
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16">
          {/* Left — contact info */}
          <div className="space-y-10">
            <p className="text-muted-foreground leading-relaxed text-sm">
              A question, a half-formed idea, or a proper proposal — send it
              over. We respond to every message within 24 hours.
            </p>

            <div className="space-y-5">
              {contactMeta.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: "hsl(var(--terra) / 0.08)",
                      border: "1px solid hsl(var(--terra) / 0.18)",
                    }}
                  >
                    <info.icon
                      className="w-4 h-4"
                      style={{ color: "hsl(var(--terra))" }}
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-0.5">
                      {info.label}
                    </span>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-foreground font-medium text-sm hover:text-primary transition-colors duration-200"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <span className="text-foreground font-medium text-sm">
                        {info.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Kente decorative strip */}
            <div className="kente-border rounded-full overflow-hidden opacity-65" />

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-4">
                Follow
              </p>
              <div className="flex flex-wrap gap-2.5">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                  >
                    {social.name}
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/55">
                  Name
                </label>
                <Input
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-12 bg-muted/30 border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/55">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-12 bg-muted/30 border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/55">
                Subject
              </label>
              <Input
                placeholder="What's on your mind?"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="h-12 bg-muted/30 border-border/60 focus:border-primary/40 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/55">
                Message
              </label>
              <Textarea
                placeholder="Give us the details — or just say hi. We'll figure it out from there."
                rows={6}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="bg-muted/30 border-border/60 focus:border-primary/40 resize-none transition-colors"
              />
            </div>

            <Button
              variant="default"
              size="lg"
              className="w-full group shadow-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send It"}
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
