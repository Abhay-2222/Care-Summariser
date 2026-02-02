export type UrgencyLevel = "STAT" | "URGENT" | "ROUTINE"
export type ConfidenceLevel = "High" | "Medium" | "Low"
export type RiskLevel = "High" | "Medium" | "Low"

// Workflow Status for PA Cases
export type CaseStatus = 
  | "new"           // Just arrived in queue
  | "in_progress"   // Case Manager working on it
  | "needs_physician" // Sent to physician for approval
  | "ready"         // All requirements met, ready for submission
  | "submitted"     // PA submitted to payer
  | "approved"      // Payer approved
  | "denied"        // Payer denied
  | "appealing"     // In appeals process

export type UserRole = "case_manager" | "physician" | "auditor"

export interface CaseAssignment {
  assignedTo: string
  assignedAt: string
  role: UserRole
}

export interface CaseWorkflow {
  status: CaseStatus
  assignment?: CaseAssignment
  statusHistory: StatusChange[]
  progressPercent: number
  readyForPA: boolean
  lastUpdated: string
  physicianDecision?: {
    decision: "approved" | "deferred" | "escalated"
    decidedBy: string
    decidedAt: string
    notes?: string
  }
}

export interface StatusChange {
  from: CaseStatus
  to: CaseStatus
  changedBy: string
  changedAt: string
  notes?: string
}

// SDOH - Social Determinants of Health
export interface SDOHFactor {
  id: string
  category: "housing" | "transportation" | "caregiver" | "financial" | "language" | "literacy" | "food_security"
  description: string
  severity: "blocking" | "barrier" | "concern"
  status: "unresolved" | "in_progress" | "resolved"
  notes?: string
}

// PA Deadline Tracking
export interface PADeadline {
  type: "initial" | "concurrent" | "appeal" | "urgent"
  deadline: string // ISO date string
  hoursRemaining: number
  isWeekend: boolean
  payerSLA: string
  status: "on_track" | "at_risk" | "overdue"
}

// Concurrent Edit Tracking
export interface EditSession {
  id: string
  user: string
  role: "physician" | "nurse" | "case_manager" | "social_work"
  startedAt: string
  lastActivity: string
  activeSection?: string
}

export interface Patient {
  id: string
  name: string
  mrn: string
  age: number
  gender: "M" | "F"
  dob: string
  ssn: string
  insurance: string
  admitted: string
  admissionDate: string
  room: string
  urgency: UrgencyLevel
  tasks: number
  lengthOfStay: string
  chiefComplaint: string
  diagnoses: string[]
  medications: string
  clinicalCourse: string
  timeline: TimelineEvent[]
  alerts: DocumentationAlert[]
  documentsProcessed: number
  // Problem List Hierarchy
  problemList: ProblemListItem[]
  // Payer Rule Checklist
  payerRules: PayerRule[]
  // CareLens Data
  careLens: CareLensData
  // Workflow Data
  workflow: CaseWorkflow
  // Edge case fields (optional)
  sdohFactors?: SDOHFactor[]
  paDeadline?: PADeadline
  activeSessions?: EditSession[]
  edgeCaseType?: string
  dataQuality?: "complete" | "sparse" | "conflicting" | "excessive"
}

export interface ProblemListItem {
  id: string
  name: string
  icdCode: string
  type: "primary" | "secondary" | "comorbidity"
  status: "active" | "resolved" | "chronic"
}

export interface PayerRule {
  id: string
  rule: string
  status: "satisfied" | "missing" | "unclear"
  evidence?: string
}

export type RecommendationStatus = "pending" | "in_progress" | "completed" | "dismissed"
export type RecommendationActionType = 
  | "request_consult" 
  | "add_documentation" 
  | "order_test" 
  | "schedule_followup"
  | "send_message"
  | "review_case"

export interface RecommendationAction {
  id: string
  type: RecommendationActionType
  label: string
  description?: string
}

export interface Recommendation {
  id: string
  text: string
  priority: "high" | "medium" | "low"
  status: RecommendationStatus
  category: "documentation" | "consultation" | "clinical" | "administrative"
  suggestedActions: RecommendationAction[]
  completedAt?: string
  completedBy?: string
  notes?: string
}

export interface CareLensData {
  overallConfidence: ConfidenceLevel
  confidenceBreakdown: {
    evidenceCompleteness: ConfidenceLevel
    policyAlignment: ConfidenceLevel
    clinicalClarity: ConfidenceLevel
  }
  denialRisk: RiskLevel
  riskFactors: RiskFactor[]
  policyGaps: PolicyGap[]
  conflictingNotes: string[]
  recommendations: Recommendation[]
  auditTrail: AuditEntry[]
}

export type RiskFactorStatus = "open" | "addressed" | "not_applicable"

export interface RiskFactorAction {
  id: string
  type: "create_plan" | "add_documentation" | "request_consult" | "order_test"
  label: string
  description?: string
}

export interface RiskFactor {
  id: string
  factor: string
  severity: RiskLevel
  mitigation?: string
  status: RiskFactorStatus
  explanation?: string
  evidenceLinks?: string[]
  suggestedActions?: RiskFactorAction[]
}

export type PolicyGapStatus = "open" | "resolved" | "in_progress"

export interface PolicyGap {
  id: string
  gap: string
  status: PolicyGapStatus
  policyReference?: string
  relatedNotes?: string[]
  resolutionNotes?: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  action: string
  user: string
}

export interface TimelineEvent {
  id: string
  timestamp: string
  title: string
  description: string
}

export interface DocumentationAlert {
  id: string
  message: string
  type: "warning" | "error"
}
