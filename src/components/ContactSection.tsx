import type { Profile } from "@/services/DataService";
import { Mail, Github, Linkedin } from "lucide-react";

interface ContactSectionProps {
  profile: Profile;
}

const ContactSection = ({ profile }: ContactSectionProps) => {
  return (
    <section id="contact" className="relative z-10 py-20 px-6">
      <div className="container mx-auto max-w-md text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Get in Touch</h2>
        <p className="text-sm text-muted-foreground mb-8">Open to collaboration and new opportunities.</p>
        <div className="flex items-center justify-center gap-6">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
