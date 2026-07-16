import { useEffect, useState } from "react";
import { grantConsent, denyConsent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem("cookie_consent");
    if (!hasConsent) {
      setVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "granted");
    grantConsent();
    setIsAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "denied");
    denyConsent();
    setIsAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay backdrop — fade in/out */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleDecline}
        aria-hidden
      />

      {/* Banner — slide up from bottom */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-[calc(100%+20px)]"
        }`}
      >
        {/* Decorative top border — terra accent */}
        <div className="h-[3px] bg-gradient-to-r from-transparent via-[hsl(22_88%_52%)] to-transparent" />

        {/* Main container */}
        <div className="bg-background border-t border-border shadow-2xl">
          <div className="container mx-auto px-6 py-10 md:py-12 lg:py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left: Content */}
              <div className="flex-1 space-y-3">
                {/* Eyebrow label */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(22_88%_52%)]" />
                  <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground/55">
                    Privacy & Analytics
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                  We Use Cookies to Improve Your Experience
                </h3>

                {/* Description */}
                <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl">
                  We use analytics to understand how you use our site and to
                  enhance your experience. You can accept all cookies or
                  customize your preferences.
                </p>

                {/* Privacy link */}
                <a
                  href="/privacy"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 mt-1"
                >
                  Learn more about our privacy policy →
                </a>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                {/* Decline button */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDecline}
                  className="h-12 px-6 border-border/50 text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200 font-medium text-sm"
                >
                  Decline
                </Button>

                {/* Accept button — primary CTA with glow */}
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleAccept}
                  className="h-12 px-6 shadow-primary hover:shadow-lg transition-all duration-200 font-medium text-sm group"
                >
                  Accept All
                  <ChevronUp className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:-translate-y-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
