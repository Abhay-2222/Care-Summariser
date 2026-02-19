// CareSummarizer Design System
// User-Centered Design for Case Managers handling 20-40 cases daily
// Prioritizes information density and quick scanning over minimalist aesthetics

// =============================================================================
// TYPOGRAPHY SYSTEM - Exactly 4 text styles
// =============================================================================

export const typography = {
  // Labels/Field Names: overline style - mono 9px, 500, tracked, uppercase
  label: "text-overline text-[var(--neutral-500)]",
  
  // Body Text/Values: body-sm - 13px, 400
  body: "text-body-sm text-[var(--neutral-600)]",
  
  // Titles/Names/Key Info: label-md - 13px, 500
  title: "text-label-md text-[var(--neutral-900)]",
  
  // Section Headers: overline style - mono 9px, 500, tracked, uppercase
  sectionHeader: "text-overline text-[var(--neutral-400)]",
} as const

// Alias for guidelines compatibility - both names reference the same styles
export const textStyles = typography

// =============================================================================
// STATUS BADGES - Consistent everywhere (list, detail, notifications)
// =============================================================================

export const statusBadgeStyles = {
  // Urgency Badges - using design system status tokens
  STAT: "bg-[var(--status-error-bg)] text-[var(--status-error-text)] border border-[var(--status-error-border)]",
  URGENT: "bg-[var(--status-warn-bg)] text-[var(--status-warn-text)] border border-[var(--status-warn-border)]", 
  ROUTINE: "bg-[var(--neutral-100)] text-[var(--neutral-600)] border border-[var(--neutral-200)]",
  
  // Workflow Status Badges
  new: "bg-[var(--status-info-bg)] text-[var(--status-info-text)] border border-[var(--status-info-border)]",
  in_progress: "bg-[var(--neutral-100)] text-[var(--neutral-600)] border border-[var(--neutral-200)]",
  needs_physician: "bg-[var(--status-warn-bg)] text-[var(--status-warn-text)] border border-[var(--status-warn-border)]",
  ready: "bg-[var(--status-ok-bg)] text-[var(--status-ok-text)] border border-[var(--status-ok-border)]",
  submitted: "bg-[var(--status-info-bg)] text-[var(--status-info-text)] border border-[var(--status-info-border)]",
  approved: "bg-[var(--status-ok-bg)] text-[var(--status-ok-text)] border border-[var(--status-ok-border)]",
  denied: "bg-[var(--status-error-bg)] text-[var(--status-error-text)] border border-[var(--status-error-border)]",
  appealing: "bg-[var(--status-warn-bg)] text-[var(--status-warn-text)] border border-[var(--status-warn-border)]",
  
  // Uppercase aliases for calibration test and template compatibility
  PENDING_REVIEW: "bg-[var(--status-warn-bg)] text-[var(--status-warn-text)] border border-[var(--status-warn-border)]",
  IN_REVIEW: "bg-[var(--status-info-bg)] text-[var(--status-info-text)] border border-[var(--status-info-border)]",
  APPROVED: "bg-[var(--status-ok-bg)] text-[var(--status-ok-text)] border border-[var(--status-ok-border)]",
  DENIED: "bg-[var(--status-error-bg)] text-[var(--status-error-text)] border border-[var(--status-error-border)]",
  MORE_INFO_NEEDED: "bg-[var(--status-warn-bg)] text-[var(--status-warn-text)] border border-[var(--status-warn-border)]",
} as const

export const statusLabels = {
  new: "New",
  in_progress: "In Progress",
  needs_physician: "Needs MD",
  ready: "Ready",
  submitted: "Submitted",
  approved: "Approved",
  denied: "Denied",
  appealing: "Appealing",
} as const

// =============================================================================
// CONTAINER STYLES - Subtle backgrounds + spacing for section separation
// =============================================================================

export const containerStyles = {
  // Primary card - white with border, 12px radius per design system
  card: "bg-card rounded-xl border border-border shadow-ds-xs",
  
  // Section background tint
  sectionBg: "bg-[var(--neutral-50)]",
  
  // Interactive card (clickable)
  interactiveCard: "bg-card rounded-xl border border-border shadow-ds-xs hover:shadow-ds-sm transition-all cursor-pointer",
  
  // Alert/warning container
  alertContainer: "bg-[var(--status-warn-bg)] border border-[var(--status-warn-border)] rounded-xl",
  
  // Success container
  successContainer: "bg-[var(--status-ok-bg)] border border-[var(--status-ok-border)] rounded-xl",
  
  // Error container  
  errorContainer: "bg-[var(--status-error-bg)] border border-[var(--status-error-border)] rounded-xl",
} as const

// =============================================================================
// SPACING - Consistent gaps and padding
// =============================================================================

export const spacing = {
  // Between major sections
  sectionGap: "space-y-4",
  
  // Within sections
  itemGap: "space-y-2",
  
  // Card padding
  cardPadding: "p-3",
  
  // Compact card padding
  cardPaddingCompact: "p-2",
} as const

// =============================================================================
// CONFIDENCE/RISK INDICATORS
// =============================================================================

export const confidenceStyles = {
  High: "text-[var(--status-ok-text)] bg-[var(--status-ok-bg)] border border-[var(--status-ok-border)]",
  Medium: "text-[var(--status-warn-text)] bg-[var(--status-warn-bg)] border border-[var(--status-warn-border)]",
  Low: "text-[var(--status-error-text)] bg-[var(--status-error-bg)] border border-[var(--status-error-border)]",
  // Lowercase aliases for calibration test compatibility
  high: "text-[var(--status-info-text)] bg-[var(--status-info-bg)] border border-[var(--status-info-border)]",
  medium: "text-[var(--status-warn-text)] bg-[var(--status-warn-bg)] border border-[var(--status-warn-border)]",
  low: "text-[var(--neutral-600)] bg-[var(--neutral-100)] border border-[var(--neutral-200)]",
} as const

export const riskStyles = {
  High: "text-[var(--status-error-text)] bg-[var(--status-error-bg)] border border-[var(--status-error-border)]",
  Medium: "text-[var(--status-warn-text)] bg-[var(--status-warn-bg)] border border-[var(--status-warn-border)]",
  Low: "text-[var(--status-ok-text)] bg-[var(--status-ok-bg)] border border-[var(--status-ok-border)]",
} as const

// Alias for guidelines compatibility
export const riskColors = riskStyles

// =============================================================================
// PROGRESS BAR STYLES
// =============================================================================

export const progressBarStyles = {
  track: "h-1 bg-[var(--neutral-150)] rounded-full overflow-hidden",
  indicator: {
    high: "bg-[var(--success)]", // >= 80%
    medium: "bg-[var(--warning)]", // >= 50%
    low: "bg-[var(--neutral-400)]",    // < 50%
  },
} as const

export function getProgressColor(percent: number): string {
  if (percent >= 80) return progressBarStyles.indicator.high
  if (percent >= 50) return progressBarStyles.indicator.medium
  return progressBarStyles.indicator.low
}

// =============================================================================
// REQUIREMENT STATUS STYLES (for Evidence ↔ Requirements links)
// =============================================================================

export const requirementStatusStyles = {
  satisfied: {
    container: "bg-[var(--status-ok-bg)] border-[var(--status-ok-border)]",
    icon: "text-[var(--success)]",
    text: "text-[var(--status-ok-text)]",
  },
  missing: {
    container: "bg-[var(--status-error-bg)] border-[var(--status-error-border)]", 
    icon: "text-[var(--destructive)]",
    text: "text-[var(--status-error-text)]",
  },
  unclear: {
    container: "bg-[var(--status-warn-bg)] border-[var(--status-warn-border)]",
    icon: "text-[var(--warning)]", 
    text: "text-[var(--status-warn-text)]",
  },
} as const
