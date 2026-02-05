"use client"

import { useState, useEffect } from "react"

export function useLoadingDelay(isLoading: boolean, delay = 500) {
    const [showLoading, setShowLoading] = useState(true)

    useEffect(() => {
        if (isLoading) {
            setShowLoading(true)
        } else {
            const timeout = setTimeout(() => setShowLoading(false), delay)
            return () => clearTimeout(timeout)
        }
    }, [isLoading, delay])

    return showLoading
}
