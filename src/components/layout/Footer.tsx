import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const footerLinks = {
  Company: [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "#" },
    { name: "Contact", href: "/contact" },
  ],
  Services: [
    { name: "Media", href: "/media" },
    { name: "Technology", href: "/technology" },
    { name: "Products", href: "/products" },
    { name: "Consulting", href: "/contact" },
  ],
  Resources: [
    { name: "Blog", href: "/media" },
    { name: "Documentation", href: "#" },
    { name: "Support", href: "/contact" },
    { name: "API", href: "#" },
  ],
  Legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Cookies", href: "#" },
  ],
};

const socials = ["Twitter", "LinkedIn", "YouTube", "Instagram"];

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background grain relative overflow-hidden">
      {/* Kente stripe at top */}
      <div className="kente-border opacity-55" />

      {/* Big statement row */}
      <div className="container mx-auto px-6 pt-20 pb-16 border-b border-background/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h2
            className="font-bold tracking-tight leading-[0.92]"
            style={{ fontSize: "clamp(40px, 7vw, 88px)" }}
          >
            Innovation Without <br />
            <span className="font-display italic text-gradient-primary">
              Borders.
            </span>
          </h2>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-background/20 text-sm font-semibold text-background/65 hover:text-background hover:border-background/40 hover:bg-background/5 transition-all duration-200 flex-shrink-0 self-start md:self-auto"
          >
            Get in touch
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Links grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <img
                src="/afrisic-logo.png"
                alt="Afrisinc"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-bold text-background tracking-tight">
                Afri
                <span className="font-display italic text-gradient-primary">
                  sinc
                </span>
              </span>
            </Link>
            <p className="text-background/38 text-sm leading-relaxed max-w-xs">
              A multi-department parent company pioneering innovation across
              technology, media, and global services.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-background/28 mb-5 font-semibold">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-background/42 hover:text-background transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container mx-auto px-6 py-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-background/24 text-xs tracking-wide">
          © {new Date().getFullYear()} Afrisinc. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {socials.map((social) => (
            <a
              key={social}
              href="#"
              className="text-background/24 hover:text-background/55 transition-colors duration-200 text-xs"
            >
              {social}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
