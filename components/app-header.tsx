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
  case_manager: { name: "Case Manager", icon: User, initials: "CM", color: "bg-blue-600" },
  physician: { name: "Physician", icon: Stethoscope, initials: "MD", color: "bg-purple-600" },
  auditor: { name: "Auditor", icon: FileCheck, initials: "AU", color: "bg-emerald-600" },
}

const SESSION_DURATION = 30 * 60
const WARNING_THRESHOLD = 5 * 60

const roles = [
  { id: "case_manager", name: "Case Manager", icon: User },
  { id: "physician", name: "Physician", icon: Stethoscope },
  { id: "auditor", name: "Auditor", icon: FileCheck },
]

const navItems = baseNavItems.filter(item => roles.some(role => role.id === item.roles[0]));

export function AppHeader() {
  const pathname = usePathname()
  const { currentRole, setCurrentRole, currentUser } = useApp()
  const [sessionTime, setSessionTime] = useState(SESSION_DURATION)

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => (prev <= 1 ? SESSION_DURATION : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const resetSession = () => setSessionTime(SESSION_DURATION)
    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach((event) => window.addEventListener(event, resetSession))
    return () => events.forEach((event) => window.removeEventListener(event, resetSession))
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isWarning = sessionTime <= WARNING_THRESHOLD
  const currentRoleData = roleConfig[currentRole]
  const navItems = baseNavItems.filter(item => item.roles.includes(currentRole))

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="flex h-11 items-center justify-between px-3">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-[11px] font-bold text-white">CS</span>
            </div>
            <span className="text-[13px] font-semibold text-slate-800 hidden sm:block">CareSummarizer</span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200 transition-colors">
            <Search className="h-3.5 w-3.5" />
            <span className="text-[11px]">Search</span>
            <kbd className="ml-2 px-1 py-0.5 rounded bg-white text-[9px] text-slate-400 border border-slate-200">Ctrl+K</kbd>
          </div>
        </div>

        {/* Center: Navigation - Compact on mobile, show only 3 items */}
        <nav className="flex items-center gap-0.5 sm:gap-1">
          <TooltipProvider delayDuration={0}>
            {navItems.slice(0, 3).map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              // On mobile, only show first 2 items
              const hideOnMobile = index >= 2
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex flex-col items-center justify-center gap-0.5 px-2 sm:px-3 py-1.5 rounded-md transition-colors min-w-[36px] sm:min-w-[52px]",
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                        hideOnMobile && "hidden sm:flex"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[8px] sm:text-[9px] font-medium leading-none hidden sm:block">{item.name}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[10px]">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>

        {/* Right: Role toggle + Utils + User - simplified for mobile */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Role Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-7 gap-1 px-1.5 sm:px-2 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <currentRoleData.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{currentRoleData.name}</span>
                <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-[10px] text-slate-500 font-normal">Switch Role (Demo)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(roleConfig).map(([id, role]) => (
                <DropdownMenuItem 
                  key={id}
                  onClick={() => setCurrentRole(id as "case_manager" | "physician" | "auditor")}
                  className={cn(
                    "text-[11px] gap-2",
                    currentRole === id && "bg-blue-50 text-blue-600"
                  )}
                >
                  <role.icon className="h-3.5 w-3.5" />
                  <div className="flex flex-col">
                    <span>{role.name}</span>
                    <span className="text-[9px] text-slate-400">
                      {id === "case_manager" && "Full access, prepare cases"}
                      {id === "physician" && "Review & approve cases"}
                      {id === "auditor" && "View-only, compliance"}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-slate-200 mx-0.5 sm:mx-1 hidden sm:block" />

          {/* Session Timer - hide on mobile */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "hidden sm:flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-mono tabular-nums",
                  isWarning ? "text-amber-600 bg-amber-50" : "text-slate-400"
                )}>
                  <Clock className="h-3 w-3" />
                  {formatTime(sessionTime)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">
                Session expires in {formatTime(sessionTime)}
              </TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <NotificationCenter />

            {/* Help - hide on mobile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="hidden sm:flex h-7 w-7 rounded-md items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-4 w-px bg-slate-200 mx-0.5 sm:mx-1 hidden sm:block" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 gap-1.5 px-1 sm:px-1.5 hover:bg-slate-100">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={cn("text-[10px] font-semibold text-white", currentRoleData.color)}>
                    {currentRoleData.initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-[11px]">
                <div className="flex flex-col">
                  <span className="font-medium">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{currentRoleData.name} - Memorial Hospital</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[11px] gap-2">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] gap-2">
                <HelpCircle className="h-3.5 w-3.5" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[11px] gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
