"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
    {
        name: "Developer",
        description: "Perfect for hacking on side projects and hobby apps.",
        price: "$0.00",
        period: "/month",
        features: [
            "Up to 1,000 MAU",
            "Real-time translation",
            "30-day message retention",
            "Community support"
        ],
        cta: "Get Started",
        href: "/signup",
        variant: "outline"
    },
    {
        name: "Enterprise",
        description: "For teams that need scale, security, and premium support.",
        price: "Custom",
        period: "",
        features: [
            "Unlimited MAU",
            "Custom SLAs & contracts",
            "Dedicated infrastructure",
            "24/7 priority support"
        ],
        cta: "Contact Sales",
        href: "/contact",
        variant: "default"
    }
];

export function Pricing() {
    return (
        <section className="py-32 bg-background border-t border-border">
            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Start for free, scale as you grow. No hidden fees.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex flex-col p-8 rounded-3xl border ${plan.variant === 'default' ? 'border-primary/50 bg-secondary/10' : 'border-border bg-card'} relative overflow-hidden`}
                        >
                            {plan.variant === 'default' && (
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                        Recommended
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground ml-2">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                            <Check className="h-3 w-3 text-primary" />
                                        </div>
                                        <span className="text-foreground/80">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                size="lg"
                                className={`w-full rounded-xl h-12 font-medium ${plan.variant === 'default' ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}
                            >
                                <Link href={plan.href}>{plan.cta}</Link>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
