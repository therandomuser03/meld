"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "How many languages does Meld support?",
        answer: "Meld supports real-time translation for over 40 languages, including major global dialects, ensuring accurate communication for your team."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use end-to-end encryption for all messages and documents. Your data is encrypted at rest and in transit."
    },
    {
        question: "Can I invite external clients?",
        answer: "Yes! You can create guest workspaces for clients or freelancers with limited permissions, allowing seamless collaboration without exposing internal data."
    },
    {
        question: "Does it integrate with other tools?",
        answer: "Meld offers integrations with popular calendars, storage providers, and development tools to keep your workflow centralized."
    }
];

export function FAQ() {
    return (
        <section className="py-32 bg-background">
            <div className="container px-4 md:px-6 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Frequently Asked Questions</h2>
                    <p className="text-xl text-muted-foreground">Everything you need to know about Meld.</p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-secondary">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-6 text-left"
            >
                <span className="text-lg font-medium text-text">{question}</span>
                <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-foreground/80 leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
