"use client"

import React from "react"

// Redwood Design System Components
// Implementing patterns from the Redwood design system for CareSummarizer AI

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle2, AlertCircle, AlertTriangle, Clock, ChevronRight } from "lucide-react"

// ============================================================================
// PAGE HEADER - Redwood Page Header component
// ============================================================================
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

// ============================================================================
// SCOREBOARD CARD (METRIC) - Redwood Scoreboard Card for KPIs
// ============================================================================
interface ScorecardProps {
  title: string
  value: string | number
  unit?: string
  trend?: {
    value: string
    direction: "up" | "down" | "neutral"
  }
  icon?: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger"
}

export function Scorecard({ title, value, unit, trend, icon, variant = "default" }: ScorecardProps) {
  const variantStyles = {
    default: "bg-card border-border",
    success: "pastel-green border-emerald-200",
    warning: "pastel-yellow border-amber-200",
    danger: "pastel-red border-red-200",
  }

  const trendColors = {
    up: "text-emerald-600",
    down: "text-red-600",
    neutral: "text-muted-foreground",
  }

  return (
    <div className={cn(
      "rounded-xl border p-4 shadow-sm transition-shadow hover:shadow",
      variantStyles[variant]
    )}>
      <div className="flex items-center gap-2 mb-3">
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg pastel-blue">
            {icon}
          </div>
        )}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-mono text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {trend && (
        <p className={cn("text-xs mt-1.5", trendColors[trend.direction])}>
          {trend.value}
        </p>
      )}
    </div>
  )
}

// ============================================================================
// LIST ITEM - Redwood List Item Layout
// ============================================================================
interface ListItemProps {
  title: string
  subtitle?: string
  meta?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function ListItem({ 
  title, 
  subtitle, 
  meta, 
  leading, 
  trailing, 
  selected, 
  onClick,
  className 
}: ListItemProps) {
  return (
    <button
      className={cn(
        "w-full flex items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors",
        "bg-card border border-transparent",
        "hover:border-border/50 hover:bg-muted/30",
        selected && "border-primary/20 bg-primary/5",
        className
      )}
      onClick={onClick}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-[13px] truncate leading-tight",
          selected ? "text-primary" : "text-foreground"
        )}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
        {meta && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{meta}</p>
        )}
      </div>
      {trailing && <div className="shrink-0 ml-1">{trailing}</div>}
    </button>
  )
}

// ============================================================================
// ACTIVITY LIST ITEM - Redwood Activity List component
// ============================================================================
interface ActivityItemProps {
  title: string
  description: string
  timestamp: string
  status?: "success" | "warning" | "pending" | "error"
  icon?: React.ReactNode
}

export function ActivityItem({ title, description, timestamp, status = "pending", icon }: ActivityItemProps) {
  const statusConfig = {
    success: { 
      bg: "pastel-green border-emerald-200", 
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 
    },
    warning: { 
      bg: "pastel-yellow border-amber-200", 
      icon: <AlertCircle className="h-4 w-4 text-amber-600" /> 
    },
    pending: { 
      bg: "pastel-blue border-primary/20", 
      icon: <Clock className="h-4 w-4 text-primary" /> 
    },
    error: { 
      bg: "pastel-red border-red-200", 
      icon: <AlertTriangle className="h-4 w-4 text-red-600" /> 
    },
  }

  const config = statusConfig[status]

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-xl border", config.bg)}>
      <div className="mt-0.5">{icon || config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <span className="text-[10px] text-muted-foreground font-mono shrink-0">{timestamp}</span>
    </div>
  )
}

// ============================================================================
// TIMELINE - Redwood Timeline component
// ============================================================================
interface TimelineEvent {
  id: string
  title: string
  description: string
  timestamp: string
  status?: "complete" | "current" | "pending"
}

interface TimelineProps {
  events: TimelineEvent[]
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="space-y-1">
      {events.map((event, index) => {
        const isLast = index === events.length - 1
        const statusColors = {
          complete: "bg-primary text-primary-foreground",
          current: "bg-primary text-primary-foreground ring-2 ring-primary/30",
          pending: "bg-muted text-muted-foreground",
        }

        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl text-xs shadow-sm",
                statusColors[event.status || "pending"]
              )}>
                {index + 1}
              </div>
              {!isLast && (
                <div className="h-full w-px bg-border my-1" />
              )}
            </div>
            <div className="flex-1 rounded-xl border border-border bg-muted/50 p-3 mb-2">
              <div className="flex items-center gap-2 text-2xs text-muted-foreground font-mono">
                <Clock className="h-3 w-3" />
                <span>{event.timestamp}</span>
              </div>
              <h4 className="mt-1.5 text-sm">{event.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// MESSAGE BANNER - Redwood Message Banner for alerts
// ============================================================================
const messageBannerVariants = cva(
  "flex items-start gap-3 rounded-xl border p-4",
  {
    variants: {
      variant: {
        info: "pastel-blue border-primary/20",
        success: "pastel-green border-emerald-200",
        warning: "pastel-yellow border-amber-200",
        error: "pastel-red border-red-200",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

interface MessageBannerProps extends VariantProps<typeof messageBannerVariants> {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function MessageBanner({ title, description, icon, action, variant }: MessageBannerProps) {
  const defaultIcons = {
    info: <AlertCircle className="h-5 w-5 text-primary" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    error: <AlertTriangle className="h-5 w-5 text-red-600" />,
  }

  return (
    <div className={messageBannerVariants({ variant })}>
      <div className="mt-0.5">{icon || defaultIcons[variant || "info"]}</div>
      <div className="flex-1">
        <p className="text-[13px] text-foreground">{title}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ============================================================================
// PROFILE CARD - Redwood Profile Card component
// ============================================================================
interface ProfileCardProps {
  name: string
  subtitle?: string
  avatar?: React.ReactNode
  meta?: { label: string; value: string }[]
  badges?: React.ReactNode
  actions?: React.ReactNode
}

export function ProfileCard({ name, subtitle, avatar, meta, badges, actions }: ProfileCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {avatar && <div className="shrink-0">{avatar}</div>}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[13px] text-foreground">{name}</h3>
              {badges}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>
      {meta && meta.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-4 mt-3 pt-3 border-t border-border">
          {meta.map((item, index) => (
            <div key={index} className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="text-xs">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SECTION - Redwood Section component with header
// ============================================================================
interface SectionProps {
  title: string
  icon?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
  children: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

export function Section({ 
  title, 
  icon, 
  badge, 
  actions, 
  children, 
  collapsible = false,
  defaultOpen = true 
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const header = (
    <div className={cn(
      "flex items-center justify-between",
      collapsible && "cursor-pointer group"
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl pastel-blue">
            {icon}
          </div>
        )}
        <h3 className="text-[13px] text-foreground">{title}</h3>
        {badge}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {collapsible && (
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-90"
          )} />
        )}
      </div>
    </div>
  )

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div 
        className="p-4"
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        {header}
      </div>
      {(!collapsible || isOpen) && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// HIERARCHY CARD - Redwood Hierarchy Card for nested data
// ============================================================================
interface HierarchyItem {
  id: string
  label: string
  code?: string
  type: "primary" | "secondary" | "tertiary"
}

interface HierarchyCardProps {
  title: string
  icon?: React.ReactNode
  items: HierarchyItem[]
}

export function HierarchyCard({ title, icon, items }: HierarchyCardProps) {
  const primary = items.filter(i => i.type === "primary")
  const secondary = items.filter(i => i.type === "secondary")
  const tertiary = items.filter(i => i.type === "tertiary")

  return (
    <Section title={title} icon={icon}>
      <div className="space-y-4">
        {primary.length > 0 && (
          <div>
            <p className="text-2xs uppercase tracking-wider text-muted-foreground mb-2">
              Primary
            </p>
            <div className="space-y-2">
              {primary.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-xl pastel-blue border border-primary/20 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.code && (
                    <span className="text-2xs font-mono text-primary bg-card px-2 py-1 rounded border border-primary/30">
                      {item.code}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {secondary.length > 0 && (
          <div>
            <p className="text-2xs uppercase tracking-wider text-muted-foreground mb-2">
              Secondary
            </p>
            <div className="space-y-2">
              {secondary.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.code && (
                    <span className="text-2xs font-mono text-muted-foreground bg-card px-2 py-1 rounded border">
                      {item.code}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tertiary.length > 0 && (
          <div>
            <p className="text-2xs uppercase tracking-wider text-muted-foreground mb-2">
              Related
            </p>
            <div className="flex flex-wrap gap-2">
              {tertiary.map(item => (
                <span 
                  key={item.id} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs"
                >
                  {item.label}
                  {item.code && (
                    <span className="text-2xs font-mono opacity-60">({item.code})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

// ============================================================================
// EMPTY STATE - Redwood Empty State component
// ============================================================================
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl pastel-blue border border-primary/20 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// ============================================================================
// STATUS BADGE - Redwood Badge variants for status
// ============================================================================
const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide border",
  {
    variants: {
      status: {
        stat: "bg-red-50 text-red-600 border-red-200/60",
        urgent: "bg-amber-50 text-amber-600 border-amber-200/60",
        routine: "bg-slate-50 text-slate-500 border-slate-200/60",
        success: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
        pending: "bg-primary/5 text-primary border-primary/20",
      },
    },
    defaultVariants: {
      status: "routine",
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
  dot?: boolean
}

export function StatusBadge({ children, status, dot }: StatusBadgeProps) {
  const dotColors = {
    stat: "bg-red-500",
    urgent: "bg-amber-500",
    routine: "bg-slate-400",
    success: "bg-emerald-500",
    pending: "bg-primary",
  }

  return (
    <span className={statusBadgeVariants({ status })}>
      {dot && <span className={cn("h-1 w-1 rounded-full", dotColors[status || "routine"])} />}
      {children}
    </span>
  )
}

// ============================================================================
// GAUGE - Redwood Gauge for confidence/progress indicators
// ============================================================================
interface GaugeProps {
  value: number
  max?: number
  label: string
  status?: "success" | "warning" | "error" | "neutral"
  showValue?: boolean
}

export function Gauge({ value, max = 100, label, status = "neutral", showValue = true }: GaugeProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const statusColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-primary",
  }

  const statusBg = {
    success: "pastel-green",
    warning: "pastel-yellow",
    error: "pastel-red",
    neutral: "bg-muted",
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500">{label}</span>
        {showValue && (
          <span className="text-[10px] font-mono text-slate-600">{value}%</span>
        )}
      </div>
      <div className={cn("h-1.5 rounded-full overflow-hidden", statusBg[status])}>
        <div 
          className={cn("h-full rounded-full transition-all", statusColors[status])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
