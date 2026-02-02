"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Shield,
  Settings,
  ClipboardList,
  Clock,
  LogOut,
  HelpCircle,
  Search,
  User,
  Stethoscope,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-context"
import { NotificationCenter } from "@/components/notification-center"

const baseNavItems = [
  { name: "Queue", href: "/", icon: ClipboardList, roles: ["case_manager", "physician"] },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["case_manager", "physician", "auditor"] },
  { name: "MD Review", href: "/medical-director", icon: Stethoscope, roles: ["physician"] },
  { name: "Appeals", href: "/appeals", icon: Shield, roles: ["case_manager"] },
  { name: "Audit", href: "/audit", icon: FileCheck, roles: ["auditor"] },
]

const roleConfig = {
  case_manager: { 
    name: "Case Manager", 
    shortName: "CM",
    icon: User, 
    initials: "CM", 
    color: "bg-blue-600",
    headerBg: "bg-gradient-to-r from-blue-50/80 to-slate-50/80",
    headerBorder: "border-blue-100/50",
    accentColor: "text-blue-600",
    activeBg: "bg-blue-100/80",
  },
  physician: { 
    name: "Physician", 
    shortName: "MD",
    icon: Stethoscope, 
    initials: "MD", 
    color: "bg-purple-600",
    headerBg: "bg-gradient-to-r from-purple-50/80 to-slate-50/80",
    headerBorder: "border-purple-100/50",
    accentColor: "text-purple-600",
    activeBg: "bg-purple-100/80",
  },
  auditor: { 
    name: "Auditor", 
    shortName: "AU",
    icon: FileCheck, 
    initials: "AU", 
    color: "bg-emerald-600",
    headerBg: "bg-gradient-to-r from-emerald-50/80 to-slate-50/80",
    headerBorder: "border-emerald-100/50",
    accentColor: "text-emerald-600",
    activeBg: "bg-emerald-100/80",
  },
}

export function AppHeader() {
  const pathname = usePathname()
  const { currentRole, setCurrentRole, currentUser } = useApp()
  const [sessionTime, setSessionTime] = useState(30 * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => (prev <= 1 ? 30 * 60 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const resetSession = () => setSessionTime(30 * 60)
    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach((event) => window.addEventListener(event, resetSession))
    return () => events.forEach((event) => window.removeEventListener(event, resetSession))
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isWarning = sessionTime <= 5 * 60
  const currentRoleData = roleConfig[currentRole]
  const navItems = baseNavItems.filter(item => item.roles.includes(currentRole))

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur-sm",
      currentRoleData.headerBg,
      currentRoleData.headerBorder
    )}>
      <div className="flex h-12 items-center px-3 md:px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4 md:mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
            <span className="text-xs font-bold text-white">CS</span>
          </div>
          <span className="text-sm font-semibold text-slate-800 hidden md:block">CareSummarizer</span>
        </Link>

        {/* Center: Navigation - Clean pill style */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isActive
                    ? cn("bg-white shadow-sm", currentRoleData.accentColor)
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Minimal utilities */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Search - Icon only on mobile */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Search (Ctrl+K)</TooltipContent>
            </Tooltip>

            {/* Session Timer - Compact */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "hidden md:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono",
                  isWarning ? "text-amber-600 bg-amber-50" : "text-slate-400 bg-white/50"
                )}>
                  <Clock className="h-3 w-3" />
                  {formatTime(sessionTime)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Session time remaining</TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <NotificationCenter />

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200/60 mx-1 hidden md:block" />

            {/* Role Switcher - Compact */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 gap-1.5 px-2 rounded-full bg-white/60 hover:bg-white text-xs font-medium shadow-sm"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className={cn("text-[9px] font-semibold text-white", currentRoleData.color)}>
                      {currentRoleData.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-slate-700">{currentRoleData.shortName}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-normal text-slate-500">
                  Signed in as <span className="font-medium text-slate-700">{currentUser.name}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wide">Switch Role</DropdownMenuLabel>
                {Object.entries(roleConfig).map(([id, role]) => (
                  <DropdownMenuItem 
                    key={id}
                    onClick={() => setCurrentRole(id as "case_manager" | "physician" | "auditor")}
                    className={cn(
                      "text-xs gap-2 cursor-pointer",
                      currentRole === id && "bg-slate-100"
                    )}
                  >
                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", role.color)}>
                      <role.icon className="h-3 w-3 text-white" />
                    </div>
                    <span>{role.name}</span>
                    {currentRole === id && (
                      <span className="ml-auto text-[10px] text-slate-400">Active</span>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs gap-2">
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs gap-2">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs gap-2 text-red-600 focus:text-red-600">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </div>
    </header>
  )
}
