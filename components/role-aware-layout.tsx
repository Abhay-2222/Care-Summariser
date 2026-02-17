"use client"

import type { ReactNode } from "react"
import { useApp } from "@/lib/app-context"

interface RoleAwareLayoutProps {
  nurseView: ReactNode
  physicianView: ReactNode
  auditorView: ReactNode
}

export function RoleAwareLayout({
  nurseView,
  physicianView,
  auditorView,
}: RoleAwareLayoutProps) {
  const { currentRole } = useApp()

  switch (currentRole) {
    case "physician":
      return <>{physicianView}</>
    case "auditor":
      return <>{auditorView}</>
    case "case_manager":
    default:
      return <>{nurseView}</>
  }
}
