"use client";

import { motion } from "framer-motion";
import { Frame, Hexagon, Layers, Zap, Command, Box } from "lucide-react";

const brands = [
    { name: "Acme Corp", icon: Frame },
    { name: "Quantum", icon: Hexagon },
    { name: "Echo Valley", icon: Layers },
    { name: "Pulsar", icon: Zap },
    { name: "Command+R", icon: Command },
    { name: "Boxy", icon: Box },
];

export function BrandTicker() {
    return (
        <section className="py-12 border-b border-border bg-background/50">
            <div className="container px-4 md:px-6">
                <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                    TRUSTED BY TEAMS AT
                </p>
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.map(({ name, icon: Icon }) => (
                        <div key={name} className="flex items-center gap-2">
                            <Icon className="h-6 w-6" />
                            <span className="text-lg font-semibold">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
