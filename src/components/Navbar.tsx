import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Youtube, BookOpen, GraduationCap, Github, Menu, X } from "lucide-react";
import { getProfile, type Profile } from "@/services/DataService";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Explore", path: "/#explore" },
  { label: "Contact", path: "/#contact" },
];

const Navbar = () => {
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    getProfile().then(setProfile).catch(console.error);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const socials = profile
    ? [
        { href: profile.linkedin, icon: Linkedin, show: true },
        { href: profile.github, icon: Github, show: true },
        { href: profile.youtube, icon: Youtube, show: !!profile.youtube },
        { href: profile.medium, icon: BookOpen, show: !!profile.medium },
        { href: profile.udemy, icon: GraduationCap, show: !!profile.udemy },
      ].filter((s) => s.show)
    : [];

  const NavItems = () => (
    <>
      {navItems.map((item) => (
        <li key={item.path}>
          {item.path.startsWith("/#") ? (
            <a
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                const id = item.path.replace("/#", "");
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else window.location.hash = id;
              }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ) : (
            <Link
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`text-sm transition-colors hover:text-foreground ${
                location.pathname === item.path ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </>
  );

  const SocialIcons = () => (
    <>
      {socials.map((s, i) => (
        <a
          key={i}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md text-muted-foreground transition-all duration-300 hover:text-primary hover:shadow-[0_0_12px_hsla(var(--primary)/0.4)]"
        >
          <s.icon className="w-4 h-4" />
        </a>
      ))}
    </>
  );

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
          <span className="text-primary">◆</span> CKB
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            <NavItems />
          </ul>
          {socials.length > 0 && (
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <SocialIcons />
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden md:hidden border-t border-border"
          >
            <div className="px-6 py-4 space-y-4">
              <ul className="space-y-3">
                <NavItems />
              </ul>
              {socials.length > 0 && (
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <SocialIcons />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
