"use client"

import React from "react"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search, 
  ArrowUp, 
  ArrowDown,
  Command,
} from "lucide-react"

interface ShortcutGroup {
  title: string
  shortcuts: {
    keys: string[]
    description: string
    icon?: React.ReactNode
  }[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Queue",
    shortcuts: [
      { keys: ["/"], description: "Focus search", icon: <Search className="h-3.5 w-3.5" /> },
      { keys: ["J"], description: "Next patient", icon: <ArrowDown className="h-3.5 w-3.5" /> },
      { keys: ["K"], description: "Previous patient", icon: <ArrowUp className="h-3.5 w-3.5" /> },
      { keys: ["?"], description: "Show shortcuts", icon: <Command className="h-3.5 w-3.5" /> },
    ],
  },
]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.key === "?" || (e.ctrlKey && e.key === "k")) {
        e.preventDefault()
        setOpen(true)
      }
      
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      {shortcut.icon && (
                        <span className="text-muted-foreground">{shortcut.icon}</span>
                      )}
                      <span>{shortcut.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="min-w-6 h-6 px-1.5 flex items-center justify-center rounded border bg-muted text-xs font-mono font-medium"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-2xs font-mono">?</kbd> or{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-2xs font-mono">Ctrl+K</kbd> to toggle this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
