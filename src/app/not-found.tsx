"use client";

import Link from "next/link";
import { Globe } from "@/components/magicui/globe";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquareCode } from "lucide-react";

const GLOBE_CONFIG = {
    width: 800,
    height: 800,
    onRender: () => { },
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 0,
    diffuse: 0.4,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [0.1, 0.1, 0.1] as [number, number, number],
    markerColor: [251 / 255, 100 / 255, 21 / 255] as [number, number, number],
    glowColor: [0.1, 0.1, 0.1] as [number, number, number],
    markers: [
        { location: [14.5995, 120.9842], size: 0.03 },
        { location: [19.076, 72.8777], size: 0.1 },
        { location: [23.8103, 90.4125], size: 0.05 },
        { location: [30.0444, 31.2357], size: 0.07 },
        { location: [39.9042, 116.4074], size: 0.08 },
        { location: [-23.5505, -46.6333], size: 0.1 },
        { location: [19.4326, -99.1332], size: 0.1 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [34.6937, 135.5022], size: 0.05 },
        { location: [41.0082, 28.9784], size: 0.06 },
    ] as { location: [number, number]; size: number }[],
};

export default function NotFound() {
    return (
        <div className="flex min-h-[100dvh] flex-col bg-slate-950 text-white overflow-hidden selection:bg-blue-500/30 font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-border/5 bg-transparent backdrop-blur-sm h-16 flex items-center px-6 md:px-10">
                <Link
                    href="/"
                    className="flex items-center gap-3 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-blue-500/20">
                        <MessageSquareCode className="h-5 w-5 text-white" />
                    </div>
                    <span>Meld</span>
                </Link>
            </nav>

            <main className="flex-1 flex items-center justify-center relative w-full overflow-hidden">
                {/* 🌍 Globe Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="relative w-[520px] h-[520px] md:w-[720px] md:h-[720px] -translate-y-12 md:-translate-y-20">
                        <Globe className="w-full h-full" config={GLOBE_CONFIG} />
                    </div>

                </div>

                {/* Gradient Overlays */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-slate-950/20 z-[1] pointer-events-none" />

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center text-center px-4 md:px-6 max-w-3xl mx-auto mt-[-5vh]">
                    {/* 404 Badge */}
                    <div className="reveal-animation" style={{ animationDelay: "100ms" }}>
                        <div className="inline-flex items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs md:text-sm font-medium text-blue-400 backdrop-blur-md shadow-sm shadow-blue-500/10 mb-6 backdrop-brightness-50">
                            404 Error
                        </div>
                    </div>

                    {/* Title */}
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight drop-shadow-2xl reveal-animation mb-6 text-white"
                        style={{ animationDelay: "200ms", textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}
                    >
                        Page not found
                    </h1>

                    {/* Description */}
                    <p
                        className="text-lg md:text-xl text-slate-200 max-w-lg leading-relaxed reveal-animation mb-10 drop-shadow-md font-medium"
                        style={{ animationDelay: "300ms" }}
                    >
                        The page you're looking for doesn't exist or has been moved.
                        Let’s get you back on track.
                    </p>

                    {/* Buttons */}
                    <div
                        className="flex flex-col sm:flex-row gap-4 reveal-animation"
                        style={{ animationDelay: "400ms" }}
                    >
                        <Button
                            asChild
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 rounded-full h-12 px-8 transition-all hover:scale-105"
                        >
                            <Link href="/">Return Home</Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full h-12 px-8 backdrop-blur-sm transition-all hover:scale-105"
                        >
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go Back
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>

            {/* Animations */}
            <style jsx global>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reveal-animation {
          opacity: 0;
          animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }
      `}</style>
        </div>
    );
}
