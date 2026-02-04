"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("sidebar-collapsed");
        if (stored) {
            setIsCollapsed(stored === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar-collapsed", String(newState));
    };

    // Prevent hydration mismatch by rendering nothing or default state until mounted
    // But for layout stability, we might want to start expanded or check cookie (advanced).
    // For now, client-side only adjustment is acceptable for this scope.
    // Prevent hydration mismatch by using a mounted state to control the Value, not the Provider
    if (!isMounted) {
        // Render with default 'false' (expanded) during SSR and initial client render
        return (
            <SidebarContext.Provider value={{ isCollapsed: false, toggleSidebar }}>
                {children}
            </SidebarContext.Provider>
        );
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
