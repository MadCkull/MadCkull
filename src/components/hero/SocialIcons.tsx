"use client";

import { motion } from "motion/react";
import { IconBrandGithub, IconBrandLinkedin, IconBrandX, IconMail } from "@tabler/icons-react";
import Link from "next/link";

const SOCIALS = [
  {
    name: "GitHub",
    icon: IconBrandGithub,
    href: "https://github.com/MadCkull",
  },
  {
    name: "LinkedIn",
    icon: IconBrandLinkedin,
    href: "https://linkedin.com/in/hassan-ali",
  },
  {
    name: "X (Twitter)",
    icon: IconBrandX,
    href: "https://twitter.com/MadCkull",
  },
  {
    name: "Email",
    icon: IconMail,
    href: "mailto:hello@madckull.com",
  },
];

export function SocialIcons() {
  return (
    <div className="flex items-center gap-6 mt-8">
      {SOCIALS.map((social) => {
        const Icon = social.icon;
        return (
          <Link
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-200 transition-colors duration-300 relative group"
            aria-label={social.name}
          >
            <Icon strokeWidth={1.5} size={22} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {social.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
