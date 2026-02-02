"use client"

import { Heart, Clock, FileStack, Users, Brain, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeHeroProps {
  userName: string
  role: "case_manager" | "physician" | "auditor"
  className?: string
}

export function WelcomeHero({ userName, role, className }: WelcomeHeroProps) {
  const firstName = userName.split(" ")[0]
  
  const roleMessages = {
    case_manager: {
      greeting: `Welcome back, ${firstName}`,
      subtext: "Let's reduce the documentation burden together",
      stats: [
        { icon: Clock, label: "Hours saved this week", value: "4.2", color: "text-emerald-600" },
        { icon: FileStack, label: "Cases completed", value: "12", color: "text-blue-600" },
      ],
    },
    physician: {
      greeting: `Good to see you, Dr. ${firstName.split(" ").pop()}`,
      subtext: "Your 2-minute reviews are ready",
      stats: [
        { icon: Clock, label: "Avg review time", value: "1.8 min", color: "text-emerald-600" },
        { icon: Shield, label: "Cases awaiting", value: "3", color: "text-blue-600" },
      ],
    },
    auditor: {
      greeting: `Hello, ${firstName}`,
      subtext: "Helping the team learn and improve",
      stats: [
        { icon: Users, label: "Team performance", value: "94%", color: "text-emerald-600" },
        { icon: Heart, label: "Patient outcomes", value: "Improving", color: "text-blue-600" },
      ],
    },
  }

  const message = roleMessages[role]

  return (
    <div className={cn("bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4 md:p-6 border border-slate-200", className)}>
      {/* Problem Acknowledgment Banner - Simple on mobile, full on desktop */}
      <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-[10px] md:text-[11px] text-blue-700 leading-relaxed">
          <strong>We know the reality:</strong>{" "}
          <span className="hidden md:inline">Physicians spend 15+ hours weekly on prior auth forms instead of with patients. 
          Case managers chase documentation across 5+ systems. CareSummarizer exists to give you that time back 
          while keeping you in control of every clinical decision.</span>
          <span className="md:hidden">We help reduce the 15+ hours spent weekly on prior auth paperwork.</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-slate-800">{message.greeting}</h1>
          <p className="text-[12px] md:text-[13px] text-slate-500 mt-0.5 md:mt-1">{message.subtext}</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-purple-50 rounded-lg border border-purple-100 self-start flex-shrink-0">
          <Brain className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600" />
          <span className="text-[9px] md:text-[10px] font-medium text-purple-700 whitespace-nowrap">CareLens AI Active</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-3 md:gap-4 mt-3 md:mt-4">
        {message.stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-1.5 md:gap-2">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <stat.icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", stat.color)} />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] text-slate-500">{stat.label}</p>
              <p className={cn("text-[13px] md:text-[14px] font-semibold", stat.color)}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Human-Centered Promise */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200">
        <div className="flex items-start gap-2">
          <Heart className="h-3 w-3 md:h-3.5 md:w-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] md:text-[10px] text-slate-500 leading-relaxed">
            <span className="font-medium text-slate-600">Our promise:</span> CareLens works <em>for</em> you, not <em>on</em> you. 
            Every recommendation is explainable, every decision is yours.
          </p>
        </div>
      </div>
    </div>
  )
}
