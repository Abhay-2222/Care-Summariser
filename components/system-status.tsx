"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Wifi,
  WifiOff,
  CloudOff,
  RefreshCw,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SystemStatusProps {
  className?: string
}

type StatusType = "connected" | "syncing" | "offline" | "error"

export function SystemStatus({ className }: SystemStatusProps) {
  const [status, setStatus] = useState<StatusType>("connected")
  const [showBanner, setShowBanner] = useState(false)
  const [lastSync, setLastSync] = useState(new Date())

  // Simulate status changes (in production, this would be real)
  useEffect(() => {
    const handleOnline = () => {
      setStatus("syncing")
      setTimeout(() => {
        setStatus("connected")
        setLastSync(new Date())
        setShowBanner(false)
      }, 1500)
    }

    const handleOffline = () => {
      setStatus("offline")
      setShowBanner(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const statusConfig = {
    connected: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      label: "Connected",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    syncing: {
      icon: RefreshCw,
      color: "text-primary",
      label: "Syncing...",
      bg: "bg-primary/5",
      border: "border-primary/20",
      animate: true,
    },
    offline: {
      icon: WifiOff,
      color: "text-amber-500",
      label: "Offline",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-500",
      label: "Connection Error",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  // Offline banner (Heuristic #1: Visibility of system status)
  if (showBanner && status === "offline") {
    return (
      <div className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg",
        config.bg,
        config.border,
        className
      )}>
        <CloudOff className="h-5 w-5 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-800">You're offline</p>
          <p className="text-xs text-amber-600">Changes will sync when you reconnect</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
          onClick={() => setShowBanner(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Compact status indicator
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
      status !== "connected" && config.bg,
      className
    )}>
      <Icon className={cn(
        "h-3.5 w-3.5",
        config.color,
        config.animate && "animate-spin"
      )} />
      {status !== "connected" && (
        <span className={cn("text-xs font-medium", config.color)}>
          {config.label}
        </span>
      )}
    </div>
  )
}

// Toast-style status updates (Heuristic #1 & #9)
export function useSystemStatus() {
  const [toasts, setToasts] = useState<{
    id: string
    type: "success" | "error" | "info" | "loading"
    message: string
  }[]>([])

  const showStatus = (type: "success" | "error" | "info" | "loading", message: string) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])

    if (type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    }

    return id
  }

  const dismissStatus = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, showStatus, dismissStatus }
}
