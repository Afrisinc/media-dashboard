import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <div key={pathname} className="animate-page-enter">
          {children}
        </div>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};
