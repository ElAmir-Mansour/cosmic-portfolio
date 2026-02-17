import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Linkedin, Youtube, BookOpen, GraduationCap, Github } from "lucide-react";
import { getProfile, type Profile } from "@/services/DataService";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Explore", path: "/#explore" },
  { label: "Contact", path: "/#contact" },
  { label: "Admin", path: "/admin" },
];

const Navbar = () => {
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(console.error);
  }, []);

  const socials = profile
    ? [
        { href: profile.linkedin, icon: Linkedin, show: true },
        { href: profile.github, icon: Github, show: true },
        { href: profile.youtube, icon: Youtube, show: !!profile.youtube },
        { href: profile.medium, icon: BookOpen, show: !!profile.medium },
        { href: profile.udemy, icon: GraduationCap, show: !!profile.udemy },
      ].filter((s) => s.show)
    : [];

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
        <div className="flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.path}>
                {item.path.startsWith("/#") ? (
                  <a
                    href={item.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    className={`text-sm transition-colors hover:text-foreground ${
                      location.pathname === item.path
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {socials.length > 0 && (
            <div className="flex items-center gap-2 border-l border-border pl-4">
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
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
