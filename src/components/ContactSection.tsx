import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import type { Profile } from "@/services/DataService";
import { Mail, Github, Linkedin, Youtube, BookOpen, GraduationCap, Send } from "lucide-react";

interface ContactSectionProps {
  profile: Profile;
}

interface FormData {
  name: string;
  email: string;
  message: string;
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
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const subject = encodeURIComponent(`Portfolio Contact from ${data.name}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    reset();
  };

  return (
    <section id="contact" role="region" aria-label="Contact" className="relative z-10 py-20 px-6">
      <div className="container mx-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-2">Get in Touch</h2>
          <p className="text-sm text-muted-foreground mb-8">Open to collaboration and new opportunities.</p>
        </motion.div>

        <div className="flex items-center justify-center gap-4 flex-wrap mb-10">
          {socialLinks(profile).filter(l => l.show).map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.href?.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsla(var(--primary)/0.3)]"
            >
              <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              {link.label}
            </motion.a>
          ))}
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="glass rounded-xl p-6 space-y-4"
        >
          <div>
            <label htmlFor="contact-name" className="sr-only">Your Name</label>
            <input
              id="contact-name"
              {...register("name", { required: "Name is required" })}
              placeholder="Your Name"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="contact-email" className="sr-only">Your Email</label>
            <input
              id="contact-email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              placeholder="Your Email"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="contact-message" className="sr-only">Your Message</label>
            <textarea
              id="contact-message"
              {...register("message", { required: "Message is required" })}
              placeholder="Your Message"
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
            {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" /> Send Message
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
