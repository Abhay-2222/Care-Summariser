import type { CaseStatus, CaseWorkflow, Patient, UserRole } from "./types"
import { statusLabels } from "./design-system"

export function requirementsMet(patient: Pick<Patient, "payerRules" | "careLens">): boolean {
  const rulesOk = patient.payerRules.every((rule) => rule.status === "satisfied")
  const noHighOpenRisk = patient.careLens.riskFactors.every(
    (risk) => !(risk.severity === "High" && risk.status === "open")
  )
  return rulesOk && noHighOpenRisk
}

// Calculate progress based on CareLens data and payer rules
export function calculateProgress(patient: Patient): number {
  const { careLens, payerRules } = patient
  
  // Weight factors
  const satisfiedRules = payerRules.filter(r => r.status === "satisfied").length
  const totalRules = payerRules.length
  const rulesProgress = totalRules > 0 ? (satisfiedRules / totalRules) * 40 : 0
  
  const resolvedGaps = careLens.policyGaps.filter(g => g.status === "resolved").length
  const totalGaps = careLens.policyGaps.length
  const gapsProgress = totalGaps > 0 ? (resolvedGaps / totalGaps) * 30 : 30
  
  const addressedRisks = careLens.riskFactors.filter(r => r.status === "addressed").length
  const totalRisks = careLens.riskFactors.length
  const risksProgress = totalRisks > 0 ? (addressedRisks / totalRisks) * 20 : 20
  
  const completedRecs = careLens.recommendations.filter(r => r.status === "completed").length
  const totalRecs = careLens.recommendations.length
  const recsProgress = totalRecs > 0 ? (completedRecs / totalRecs) * 10 : 10
  
  return Math.round(rulesProgress + gapsProgress + risksProgress + recsProgress)
}

// Check if case is ready for PA submission
export function isReadyForPA(patient: Patient): boolean {
  return requirementsMet(patient)
}

// Generate initial workflow state based on patient data
export function generateWorkflow(patient: Omit<Patient, "workflow">, index: number): CaseWorkflow {
  const progress = calculateProgressFromPartial(patient)
  const readyForPA = requirementsMet(patient)
  const otherStatuses: CaseStatus[] = [
    "new",
    "in_progress",
    "needs_physician",
    "escalated",
    "submitted",
    "denied",
    "appealing",
  ]
  const status: CaseStatus = readyForPA ? "ready" : otherStatuses[index % otherStatuses.length]
  
  const mockUsers = [
    { name: "Maria Santos", role: "case_manager" as UserRole },
    { name: "James Wilson", role: "case_manager" as UserRole },
    { name: "Emily Chen", role: "case_manager" as UserRole },
    { name: "Dr. Robert Kim", role: "physician" as UserRole },
    { name: "Dr. Sarah Patel", role: "physician" as UserRole },
  ]
  
  const assignedUser = mockUsers[index % mockUsers.length]
  
  const workflow: CaseWorkflow = {
    status,
    progressPercent: progress,
    readyForPA,
    lastUpdated: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    statusHistory: [],
  }
  
  // Add assignment for non-new cases
  if (status !== "new") {
    workflow.assignment = {
      assignedTo: assignedUser.name,
      assignedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
      role: assignedUser.role,
    }
    
    workflow.statusHistory.push({
      from: "new",
      to: "in_progress",
      changedBy: assignedUser.name,
      changedAt: workflow.assignment.assignedAt,
      notes: "Case claimed for review"
    })
  }
  
  if (status === "escalated") {
    const physician = mockUsers.find(u => u.role === "physician") || mockUsers[3]
    workflow.physicianDecision = {
      decision: "escalated",
      decidedBy: physician.name,
      decidedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      notes: "Sent to the medical director.",
    }
  }

  // Add physician decision for approved/denied cases
  if (status === "approved" || status === "denied" || status === "submitted") {
    const physician = mockUsers.find(u => u.role === "physician") || mockUsers[3]
    workflow.physicianDecision = {
      decision: status === "denied" ? "escalated" : "approved",
      decidedBy: physician.name,
      decidedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      notes: status === "approved" ? "Documentation complete, approved for submission" : undefined
    }
  }
  
  return workflow
}

// Helper functions that work with partial patient data
function calculateProgressFromPartial(patient: Omit<Patient, "workflow">): number {
  const { careLens, payerRules } = patient
  
  const satisfiedRules = payerRules.filter(r => r.status === "satisfied").length
  const totalRules = payerRules.length
  const rulesProgress = totalRules > 0 ? (satisfiedRules / totalRules) * 40 : 0
  
  const resolvedGaps = careLens.policyGaps.filter(g => g.status === "resolved").length
  const totalGaps = careLens.policyGaps.length
  const gapsProgress = totalGaps > 0 ? (resolvedGaps / totalGaps) * 30 : 30
  
  return Math.round(rulesProgress + gapsProgress + 30)
}

// Status display helpers - labels come from the design system
// Uses design system: bg-{color}-50, text-{color}-600, border-{color}-200
export const statusConfig: Record<CaseStatus, { 
  label: string
  color: string
  bgColor: string
  borderColor: string
  badgeClass: string // Combined class for easy use
}> = {
  new: { 
    label: statusLabels.new, 
    color: "text-blue-600", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeClass: "text-[var(--neutral-600)]"
  },
  in_progress: { 
    label: statusLabels.in_progress, 
    color: "text-slate-600", 
    bgColor: "bg-slate-100",
    borderColor: "border-slate-200",
    badgeClass: "text-[var(--neutral-600)]"
  },
  needs_physician: { 
    label: statusLabels.needs_physician, 
    color: "text-[var(--neutral-600)]", 
    bgColor: "bg-transparent",
    borderColor: "border-transparent",
    badgeClass: "text-[var(--neutral-600)]"
  },
  escalated: {
    label: statusLabels.escalated,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeClass: "text-[var(--status-error-text)]",
  },
  ready: { 
    label: statusLabels.ready, 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeClass: "text-[var(--neutral-600)]"
  },
  submitted: { 
    label: statusLabels.submitted, 
    color: "text-sky-600", 
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    badgeClass: "text-[var(--neutral-600)]"
  },
  approved: { 
    label: statusLabels.approved, 
    color: "text-green-600", 
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeClass: "text-[var(--neutral-600)]"
  },
  denied: { 
    label: statusLabels.denied, 
    color: "text-[var(--status-error-text)]", 
    bgColor: "bg-transparent",
    borderColor: "border-transparent",
    badgeClass: "text-[var(--status-error-text)]"
  },
  appealing: { 
    label: statusLabels.appealing, 
    color: "text-orange-600", 
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeClass: "text-[var(--neutral-600)]"
  },
}

// Urgency badge styles - consistent everywhere
export const urgencyConfig: Record<string, {
  label: string
  badgeClass: string
}> = {
  STAT: { 
    label: "STAT", 
    badgeClass: "text-[var(--status-error-text)]"
  },
  URGENT: { 
    label: "Urgent", 
    badgeClass: "text-[var(--neutral-600)]"
  },
  ROUTINE: { 
    label: "Routine", 
    badgeClass: "text-[var(--neutral-500)]"
  },
}

// Get next possible statuses based on current status and role
export function getNextStatuses(currentStatus: CaseStatus, role: UserRole): CaseStatus[] {
  const transitions: Record<CaseStatus, Record<UserRole, CaseStatus[]>> = {
    new: {
      case_manager: ["in_progress"],
      physician: [],
      auditor: [],
    },
    in_progress: {
      case_manager: ["needs_physician", "ready"],
      physician: ["ready", "in_progress"],
      auditor: [],
    },
    needs_physician: {
      case_manager: ["in_progress"],
      physician: ["ready", "in_progress", "escalated"],
      auditor: [],
    },
    escalated: {
      case_manager: [],
      physician: ["ready", "in_progress"],
      auditor: [],
    },
    ready: {
      case_manager: ["submitted", "in_progress"],
      physician: ["submitted", "in_progress"],
      auditor: [],
    },
    submitted: {
      case_manager: ["approved", "denied"],
      physician: [],
      auditor: [],
    },
    approved: {
      case_manager: [],
      physician: [],
      auditor: [],
    },
    denied: {
      case_manager: ["appealing"],
      physician: [],
      auditor: [],
    },
    appealing: {
      case_manager: ["approved", "denied"],
      physician: [],
      auditor: [],
    },
  }
  
  return transitions[currentStatus][role] || []
}

// Check if user can perform action on case
export function canPerformAction(action: string, role: UserRole, caseStatus: CaseStatus): boolean {
  const permissions: Record<string, Record<UserRole, CaseStatus[]>> = {
    claim: {
      case_manager: ["new"],
      physician: [],
      auditor: [],
    },
    edit: {
      case_manager: ["new", "in_progress", "needs_physician"],
      physician: ["needs_physician"],
      auditor: [],
    },
    send_to_physician: {
      case_manager: ["in_progress"],
      physician: [],
      auditor: [],
    },
    approve: {
      case_manager: [],
      physician: ["needs_physician", "escalated", "ready"],
      auditor: [],
    },
    submit: {
      case_manager: ["ready"],
      physician: ["ready"],
      auditor: [],
    },
    view_audit: {
      case_manager: [],
      physician: [],
      auditor: ["new", "in_progress", "needs_physician", "escalated", "ready", "submitted", "approved", "denied", "appealing"],
    },
  }
  
  return permissions[action]?.[role]?.includes(caseStatus) || false
}
