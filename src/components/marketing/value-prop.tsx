"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const benefits = [
    "Real-time cross-border collaboration",
    "Automated message & document translation",
    "Secure, end-to-end encrypted workspace",
    "Integrated task management & notes"
];

export function ValueProp() {
    return (
        <section className="py-32 bg-background relative overflow-hidden border-t border-border">
            <div className="container px-4 md:px-6 relative z-10">
                <div className="mb-24">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 max-w-3xl">
                        Build product, not <br />
                        <span className="text-muted-foreground">messaging infrastructure.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Focus on your core application logic while Meld handles the complexities of real-time translation and state synchronization.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Left Column - Features List */}
                    <div className="space-y-12">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-6"
                            >
                                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                    <span className="font-mono font-bold text-primary">{index + 1}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">{benefit}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Enterprise-grade tooling available out of the box.
                                        Scale from day one without worrying about infrastructure limits.
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Column - Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl border border-border bg-secondary/20 p-8 aspect-square flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl" />

                        {/* Abstract Visual Representation */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm relative z-10">
                            <div className="h-32 rounded-lg bg-background border border-border shadow-lg" />
                            <div className="h-32 rounded-lg bg-primary/20 border border-primary/30 shadow-lg translate-y-8" />
                            <div className="h-32 rounded-lg bg-secondary border border-border shadow-lg -translate-y-8" />
                            <div className="h-32 rounded-lg bg-background border border-border shadow-lg" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
