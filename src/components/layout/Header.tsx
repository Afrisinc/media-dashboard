import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "Technology", href: "/technology" },
  { name: "Media", href: "/media" },
  { name: "Products", href: "/products" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, token } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "glass shadow-card py-3" : "bg-transparent py-5"
      }`}
    >
      {/* Kente accent line at bottom — visible when scrolled */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 kente-border opacity-35" />
      )}

      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <img
            src="/afrisic-logo.png"
            alt="Afrisinc"
            className="w-9 h-9 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-base font-bold tracking-tight text-foreground">
            Afri
            <span className="font-display italic text-gradient-primary">
              sinc
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`relative text-sm font-medium pb-0.5 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-px after:bg-primary after:transition-all after:duration-300 ${
                isActive(link.href)
                  ? "text-primary after:w-full"
                  : "text-muted-foreground hover:text-foreground after:w-0 hover:after:w-full"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user && token ? (
            <Button
              variant="default"
              size="sm"
              className="group shadow-primary"
              asChild
            >
              <Link to="/dashboard">
                Dashboard
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </Link>
            </Button>
          ) : (
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
            >
              Get in touch
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-border/60 text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile Menu — dark section pattern */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-foreground text-background grain relative overflow-hidden animate-fade-up">
          {/* Kente stripe at top */}
          <div className="absolute top-0 left-0 right-0 kente-border opacity-55" />

          <div className="container mx-auto px-6 pt-8 pb-10 flex flex-col relative z-10">
            {/* Numbered nav links */}
            <nav className="divide-y divide-background/10">
              {navLinks.map((link, i) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-5 py-4 transition-colors duration-200 ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-background/65 hover:text-background"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span
                    className="font-display italic font-bold text-background/15 flex-shrink-0 leading-none"
                    style={{ fontSize: "18px", lineHeight: 1 }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold tracking-tight">
                    {link.name}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Bottom row */}
            <div className="mt-8 pt-6 border-t border-background/10 flex items-center justify-between gap-4">
              <ThemeToggle />
              {user && token ? (
                <Button
                  variant="default"
                  size="sm"
                  className="group shadow-primary"
                  asChild
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </Link>
                </Button>
              ) : (
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-background/20 text-sm font-semibold text-background/65 hover:text-background hover:border-background/40 hover:bg-background/5 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get in touch
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
