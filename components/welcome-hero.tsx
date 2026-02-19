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
        { icon: Clock, label: "Hours saved this week", value: "4.2", color: "text-[var(--success)]" },
        { icon: FileStack, label: "Cases completed", value: "12", color: "text-[var(--brand-500)]" },
      ],
    },
    physician: {
      greeting: `Good to see you, Dr. ${firstName.split(" ").pop()}`,
      subtext: "Your 2-minute reviews are ready",
      stats: [
        { icon: Clock, label: "Avg review time", value: "1.8 min", color: "text-[var(--success)]" },
        { icon: Shield, label: "Cases awaiting", value: "3", color: "text-[var(--brand-500)]" },
      ],
    },
    auditor: {
      greeting: `Hello, ${firstName}`,
      subtext: "Helping the team learn and improve",
      stats: [
        { icon: Users, label: "Team performance", value: "94%", color: "text-[var(--success)]" },
        { icon: Heart, label: "Patient outcomes", value: "Improving", color: "text-[var(--brand-500)]" },
      ],
    },
  }

  const message = roleMessages[role]

  return (
    <div className={cn("bg-card rounded-xl p-4 md:p-6 border border-border shadow-ds-xs", className)}>
      {/* Problem Acknowledgment Banner - Simple on mobile, full on desktop */}
      <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-[var(--status-info-bg)] rounded-lg border border-[var(--status-info-border)]">
        <p className="text-caption md:text-body-sm text-[var(--status-info-text)]">
          <strong>We know the reality:</strong>{" "}
          <span className="hidden md:inline">Physicians spend 15+ hours weekly on prior auth forms instead of with patients. 
          Case managers chase documentation across 5+ systems. CareSummarizer exists to give you that time back 
          while keeping you in control of every clinical decision.</span>
          <span className="md:hidden">We help reduce the 15+ hours spent weekly on prior auth paperwork.</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-heading-lg text-foreground">{message.greeting}</h1>
          <p className="text-body-sm text-[var(--neutral-500)] mt-0.5 md:mt-1">{message.subtext}</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--brand-50)] rounded-lg border border-[var(--brand-100)] self-start flex-shrink-0">
          <Brain className="h-3.5 w-3.5 md:h-4 md:w-4 text-[var(--brand-500)]" />
          <span className="text-overline text-[var(--brand-700)] whitespace-nowrap">CareLens AI Active</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-3 md:gap-4 mt-3 md:mt-4">
        {message.stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-1.5 md:gap-2">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-[var(--neutral-50)] flex items-center justify-center shadow-ds-xs border border-border">
              <stat.icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", stat.color)} />
            </div>
            <div>
              <p className="text-overline text-[var(--neutral-500)]">{stat.label}</p>
              <p className={cn("text-clinical-val", stat.color)}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Human-Centered Promise */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
        <div className="flex items-start gap-2">
          <Heart className="h-3 w-3 md:h-3.5 md:w-3.5 text-[var(--destructive)] flex-shrink-0 mt-0.5" />
          <p className="text-caption text-[var(--neutral-500)]">
            <span className="text-label-sm text-[var(--neutral-600)]">Our promise:</span> CareLens works <em>for</em> you, not <em>on</em> you. 
            Every recommendation is explainable, every decision is yours.
          </p>
        </div>
      </div>
    </div>
  )
}
