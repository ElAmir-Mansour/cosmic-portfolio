import type { Profile } from "@/services/DataService";
import { Mail, Github, Linkedin, Youtube, BookOpen, GraduationCap } from "lucide-react";

interface ContactSectionProps {
  profile: Profile;
}

const socialLinks = (profile: Profile) => [
  { href: `mailto:${profile.email}`, icon: Mail, label: "Email", show: true },
  { href: profile.github, icon: Github, label: "GitHub", show: true },
  { href: profile.linkedin, icon: Linkedin, label: "LinkedIn", show: true },
  { href: profile.youtube, icon: Youtube, label: "YouTube", show: !!profile.youtube },
  { href: profile.medium, icon: BookOpen, label: "Medium", show: !!profile.medium },
  { href: profile.udemy, icon: GraduationCap, label: "Udemy", show: !!profile.udemy },
];

const ContactSection = ({ profile }: ContactSectionProps) => {
  return (
    <section id="contact" className="relative z-10 py-20 px-6">
      <div className="container mx-auto max-w-lg text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Get in Touch</h2>
        <p className="text-sm text-muted-foreground mb-8">Open to collaboration and new opportunities.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {socialLinks(profile).filter(l => l.show).map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href?.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsla(var(--primary)/0.3)]"
            >
              <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
