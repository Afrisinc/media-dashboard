import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: {
          DEFAULT: "hsl(var(--border))",
          2: "hsl(var(--border-2))",
          3: "hsl(var(--border-3))",
          4: "hsl(var(--border-4))",
          5: "hsl(var(--border-5))",
          6: "hsl(var(--border-6))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        shell: "hsl(var(--shell))",
        bar: "hsl(var(--bar))",
        stage: {
          DEFAULT: "hsl(var(--stage))",
          2: "hsl(var(--stage-2))",
        },
        sunk: {
          DEFAULT: "hsl(var(--sunk))",
          2: "hsl(var(--sunk-2))",
        },
        inset: {
          DEFAULT: "hsl(var(--inset))",
          2: "hsl(var(--inset-2))",
          3: "hsl(var(--inset-3))",
        },
        track: {
          DEFAULT: "hsl(var(--track))",
          2: "hsl(var(--track-2))",
        },
        active: {
          DEFAULT: "hsl(var(--active))",
          2: "hsl(var(--active-2))",
        },
        line: {
          DEFAULT: "hsl(var(--line))",
          2: "hsl(var(--line-2))",
        },
        overlay: "hsl(var(--overlay))",
        ink: {
          DEFAULT: "hsl(var(--foreground))",
          b: "hsl(var(--ink-b))",
          c: "hsl(var(--ink-c))",
          d: "hsl(var(--ink-d))",
          e: "hsl(var(--ink-e))",
          f: "hsl(var(--ink-f))",
        },
        mut: {
          DEFAULT: "hsl(var(--muted-foreground))",
          2: "hsl(var(--mut-2))",
          3: "hsl(var(--mut-3))",
          4: "hsl(var(--mut-4))",
          5: "hsl(var(--mut-5))",
        },
        dim: {
          2: "hsl(var(--dim-2))",
          3: "hsl(var(--dim-3))",
          4: "hsl(var(--dim-4))",
          5: "hsl(var(--dim-5))",
          6: "hsl(var(--dim-6))",
          7: "hsl(var(--dim-7))",
          8: "hsl(var(--dim-8))",
        },
        amber: "hsl(var(--amber))",
        emerald: {
          DEFAULT: "hsl(var(--emerald))",
          mid: "hsl(var(--emerald-mid))",
          light: "hsl(var(--emerald-light))",
        },
        platform: {
          facebook: "hsl(var(--platform-facebook))",
          instagram: "hsl(var(--platform-instagram))",
          tiktok: "hsl(var(--platform-tiktok))",
          youtube: "hsl(var(--platform-youtube))",
          linkedin: "hsl(var(--platform-linkedin))",
          whatsapp: "hsl(var(--platform-whatsapp))",
          spotify: "hsl(var(--platform-spotify))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          400: "hsl(var(--primary-400))",
          300: "hsl(var(--primary-300))",
          200: "hsl(var(--primary-200))",
          100: "hsl(var(--primary-100))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          hi: "hsl(var(--card-hi))",
          "hi-2": "hsl(var(--card-hi-2))",
        },
        forest: {
          DEFAULT: "hsl(var(--forest))",
          light: "hsl(var(--forest-light))",
        },
        charcoal: "hsl(var(--charcoal))",
        indigo: "hsl(var(--indigo))",
        cream: "hsl(var(--cream))",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 3s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
