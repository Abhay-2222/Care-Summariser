import type { CaseStatus, CaseWorkflow, Patient, UserRole } from "./types"

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
  const { careLens, payerRules } = patient
  
  const allRulesSatisfied = payerRules.every(r => r.status === "satisfied")
  const noHighRisks = careLens.riskFactors.filter(r => r.severity === "High" && r.status === "open").length === 0
  const confidenceHigh = careLens.overallConfidence === "High"
  
  return allRulesSatisfied && noHighRisks && confidenceHigh
}

// Generate initial workflow state based on patient data
export function generateWorkflow(patient: Omit<Patient, "workflow">, index: number): CaseWorkflow {
  const progress = calculateProgressFromPartial(patient)
  const readyForPA = isReadyForPAFromPartial(patient)
  
  // Distribute statuses across patients for demo variety
  const statusDistribution: CaseStatus[] = [
    "new", "new", "new",
    "in_progress", "in_progress", "in_progress", "in_progress",
    "needs_physician", "needs_physician",
    "ready", "ready",
    "submitted",
    "approved",
    "denied"
  ]
  
  const status = statusDistribution[index % statusDistribution.length]
  
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

function isReadyForPAFromPartial(patient: Omit<Patient, "workflow">): boolean {
  const { careLens, payerRules } = patient
  
  const allRulesSatisfied = payerRules.every(r => r.status === "satisfied")
  const noHighRisks = careLens.riskFactors.filter(r => r.severity === "High" && r.status === "open").length === 0
  
  return allRulesSatisfied && noHighRisks
}

// Status display helpers - Consistent badge styles everywhere
// Uses design system: bg-{color}-50, text-{color}-600, border-{color}-200
export const statusConfig: Record<CaseStatus, { 
  label: string
  color: string
  bgColor: string
  borderColor: string
  badgeClass: string // Combined class for easy use
}> = {
  new: { 
    label: "New", 
    color: "text-blue-600", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeClass: "bg-blue-50 text-blue-600 border border-blue-200"
  },
  in_progress: { 
    label: "In Progress", 
    color: "text-slate-600", 
    bgColor: "bg-slate-100",
    borderColor: "border-slate-200",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200"
  },
  needs_physician: { 
    label: "Needs MD", 
    color: "text-purple-600", 
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeClass: "bg-purple-50 text-purple-600 border border-purple-200"
  },
  ready: { 
    label: "Ready", 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-200"
  },
  submitted: { 
    label: "Submitted", 
    color: "text-purple-600", 
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeClass: "bg-purple-50 text-purple-600 border border-purple-200"
  },
  approved: { 
    label: "Approved", 
    color: "text-green-600", 
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeClass: "bg-green-50 text-green-600 border border-green-200"
  },
  denied: { 
    label: "Denied", 
    color: "text-red-600", 
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeClass: "bg-red-50 text-red-600 border border-red-200"
  },
  appealing: { 
    label: "Appealing", 
    color: "text-orange-600", 
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeClass: "bg-orange-50 text-orange-600 border border-orange-200"
  },
}

// Urgency badge styles - consistent everywhere
export const urgencyConfig: Record<string, {
  label: string
  badgeClass: string
}> = {
  STAT: { 
    label: "STAT", 
    badgeClass: "bg-red-50 text-red-600 border border-red-200"
  },
  URGENT: { 
    label: "Urgent", 
    badgeClass: "bg-amber-50 text-amber-600 border border-amber-200"
  },
  ROUTINE: { 
    label: "Routine", 
    badgeClass: "bg-slate-50 text-slate-500 border border-slate-200"
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
      physician: ["needs_physician", "ready"],
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
      auditor: ["new", "in_progress", "needs_physician", "ready", "submitted", "approved", "denied", "appealing"],
    },
  }
  
  return permissions[action]?.[role]?.includes(caseStatus) || false
}
