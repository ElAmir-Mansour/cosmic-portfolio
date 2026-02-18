import { motion } from "framer-motion";
import { ArrowUp, Github, Linkedin, Mail, BookOpen, Youtube, GraduationCap } from "lucide-react";
import type { Profile } from "@/services/DataService";

interface CosmicFooterProps {
  profile: Profile;
}

const quickLinks = [
  { label: "Home", href: "#" },
  { label: "Explore", href: "#explore" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const socialIcons = (profile: Profile) => [
  { href: profile.github, icon: Github, label: "GitHub", show: !!profile.github },
  { href: profile.linkedin, icon: Linkedin, label: "LinkedIn", show: !!profile.linkedin },
  { href: `mailto:${profile.email}`, icon: Mail, label: "Email", show: !!profile.email },
  { href: profile.youtube, icon: Youtube, label: "YouTube", show: !!profile.youtube },
  { href: profile.medium, icon: BookOpen, label: "Medium", show: !!profile.medium },
  { href: profile.udemy, icon: GraduationCap, label: "Udemy", show: !!profile.udemy },
];

const CosmicFooter = ({ profile }: CosmicFooterProps) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === "#") {
      scrollToTop();
      return;
    }
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 border-t border-border/30">
      {/* Subtle glow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 tracking-wide">
              {profile.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {profile.title}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Navigate
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleQuickLink(e, link.href)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Connect
            </h4>
            <div className="flex gap-3 flex-wrap">
              {socialIcons(profile)
                .filter((s) => s.show)
                .map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    aria-label={s.label}
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/20 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground/60">
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" /> Top
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default CosmicFooter;
