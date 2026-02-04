"use client";

import { motion } from "framer-motion";
import { Languages, Shield, Layout, Globe, Zap, Users } from "lucide-react";

const features = [
  {
    title: "Automated Translation",
    description: "Instantly translate chat messages, documents, and tasks into 40+ languages with neural machine precision.",
    icon: Languages,
    color: "bg-blue-500",
  },
  {
    title: "Customizable Workspaces",
    description: "Tailor your dashboard with flexible widgets. Combine notes, kanban boards, and chat in one view.",
    icon: Layout,
    color: "bg-purple-500",
  },
  {
    title: "Secure Encrypted Vault",
    description: "Enterprise-grade AES-256 encryption ensures your sensitive project data never falls into the wrong hands.",
    icon: Shield,
    color: "bg-emerald-500",
  },
  {
    title: "Global Collaboration",
    description: "Work asynchronously with teams across time zones. Real-time sync ensures you're always up to date.",
    icon: Globe,
    color: "bg-orange-500",
  },
  {
    title: "Lightning Fast Sync",
    description: "Built on edge-first architecture for milliseconds latency, no matter where your team is located.",
    icon: Zap,
    color: "bg-amber-500",
  },
  {
    title: "Role-Based Access",
    description: "Granular permission controls for admins, members, and guests. Manage who sees what with ease.",
    icon: Users,
    color: "bg-pink-500",
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text mb-6">
            The Next Generation of <br />
            <span className="text-primary">Global Collaboration</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Meld is built for performance, security, and seamless interaction across any language barrier.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group p-8 rounded-2xl border border-border bg-card hover:bg-secondary/20 transition-all duration-300 relative overflow-hidden ${index === 0 || index === 3 ? 'md:col-span-2' : ''}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon className="w-24 h-24" />
              </div>

              <div className={`h-12 w-12 rounded-lg ${feature.color} bg-opacity-20 flex items-center justify-center mb-6`}>
                <feature.icon className={`h-6 w-6 text-foreground`} />
              </div>

              <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}