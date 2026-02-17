"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Patient, RecommendationStatus, RiskFactorStatus, PolicyGapStatus, CaseStatus, UserRole, Permission, AuditEntry } from "./types"
import { ROLE_PERMISSIONS } from "./types"
import { allPatients } from "./patient-data"
import { edgeCasePatients } from "./edge-case-patients"
import { generateWorkflow, calculateProgress, isReadyForPA } from "./workflow-utils"

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    mrn: "MRN-892451",
    age: 67,
    gender: "F",
    dob: "03/15/1958",
    ssn: "***-**-4521",
    insurance: "Medicare Advantage",
    admitted: "2 days ago",
    admissionDate: "Jan 5, 2026",
    room: "304-A",
    urgency: "STAT",
    tasks: 3,
    lengthOfStay: "2 days",
    chiefComplaint: "Acute onset shortness of breath and chest pain, worsening over 24 hours",
    diagnoses: ["Acute heart failure", "COPD exacerbation", "Pulmonary edema"],
    medications:
      "Furosemide 40mg IV BID, Metoprolol 25mg PO BID, Lisinopril 10mg PO daily, Albuterol nebulizer q4h PRN, Oxygen 2L NC",
    clinicalCourse:
      "Patient admitted via ED with acute decompensated heart failure. Chest X-ray shows bilateral pulmonary edema. BNP elevated at 1,240. Started on IV diuretics with good response. Fluid balance -1.2L in first 24 hours. Oxygen requirements decreasing.",
    timeline: [
      {
        id: "1",
        timestamp: "Jan 5, 2026 14:30",
        title: "ED Admission",
        description:
          "Patient presented with acute SOB and chest pain. Vital signs: BP 160/95, HR 105, RR 24, O2 88% RA",
      },
      {
        id: "2",
        timestamp: "Jan 5, 2026 16:45",
        title: "Diagnostic Imaging",
        description: "Chest X-ray: Bilateral pulmonary edema, cardiomegaly. Echocardiogram: EF 30-35%, LV dysfunction",
      },
      {
        id: "3",
        timestamp: "Jan 6, 2026 08:00",
        title: "Treatment Response",
        description: "Good diuretic response. O2 requirements down to 2L NC. Patient reports improved breathing",
      },
    ],
    alerts: [
      {
        id: "1",
        message: "Missing cardiology consultation note for medical necessity justification",
        type: "warning",
      },
      {
        id: "2",
        message: "Incomplete medication reconciliation - need home medication list",
        type: "warning",
      },
    ],
    documentsProcessed: 12,
    problemList: [
      { id: "1", name: "Acute Decompensated Heart Failure", icdCode: "I50.31", type: "primary", status: "active" },
      { id: "2", name: "COPD with Acute Exacerbation", icdCode: "J44.1", type: "secondary", status: "active" },
      { id: "3", name: "Pulmonary Edema", icdCode: "J81.0", type: "secondary", status: "active" },
      { id: "4", name: "Hypertension", icdCode: "I10", type: "comorbidity", status: "chronic" },
      { id: "5", name: "Type 2 Diabetes", icdCode: "E11.9", type: "comorbidity", status: "chronic" },
    ],
    payerRules: [
      { id: "1", rule: "Documented medical necessity for inpatient admission", status: "satisfied", evidence: "ED notes, vital signs" },
      { id: "2", rule: "Failed outpatient management documented", status: "satisfied", evidence: "Clinical history" },
      { id: "3", rule: "Cardiology consultation within 24 hours", status: "missing" },
      { id: "4", rule: "Discharge planning initiated", status: "unclear" },
      { id: "5", rule: "BNP/Troponin levels documented", status: "satisfied", evidence: "Lab results" },
    ],
    careLens: {
      overallConfidence: "Medium",
      confidenceBreakdown: {
        evidenceCompleteness: "High",
        policyAlignment: "Medium",
        clinicalClarity: "High",
      },
      denialRisk: "Medium",
      riskFactors: [
        { 
          id: "rf-1", 
          factor: "Missing cardiology consultation note", 
          severity: "High", 
          mitigation: "Request consult note from cardiology",
          status: "open",
          explanation: "Payer policy requires cardiology consultation documentation within 24 hours for heart failure admissions. Without this, the case has a 73% denial probability based on historical data.",
          evidenceLinks: ["ED Admission Note", "Cardiology Order - Pending"],
          suggestedActions: [
            { id: "rfa-1", type: "request_consult", label: "Request Cardiology Note", description: "Send urgent request to cardiology for consultation note" },
            { id: "rfa-2", type: "add_documentation", label: "Draft Interim Note", description: "Create interim documentation while awaiting consult" },
          ]
        },
        { 
          id: "rf-2", 
          factor: "Length of stay approaching threshold", 
          severity: "Medium", 
          mitigation: "Document continued medical necessity",
          status: "open",
          explanation: "Current LOS is 2 days. Medicare Advantage typically allows 3-4 days for heart failure. Documentation of ongoing medical necessity is required to justify continued stay.",
          evidenceLinks: ["Daily Progress Notes", "Vitals Trend"],
          suggestedActions: [
            { id: "rfa-3", type: "add_documentation", label: "Add Medical Necessity Note", description: "Document specific reasons for continued inpatient care" },
            { id: "rfa-4", type: "create_plan", label: "Create Discharge Plan", description: "Document anticipated discharge criteria and timeline" },
          ]
        },
      ],
      policyGaps: [
        { 
          id: "pg-1", 
          gap: "Cardiology consultation not documented within required 24-hour window", 
          status: "open",
          policyReference: "Medicare LCD L35000: Heart Failure Inpatient Criteria - Section 4.2",
          relatedNotes: ["ED Note - Jan 5, 2026", "Admission Orders"],
        },
        { 
          id: "pg-2", 
          gap: "Discharge criteria checklist incomplete", 
          status: "open",
          policyReference: "Hospital Policy HP-2024-112: Discharge Planning Requirements",
          relatedNotes: ["Nursing Assessment", "Care Coordination Notes"],
        },
      ],
      conflictingNotes: [
        "ED note states 'stable for observation' vs. Admission note states 'requires ICU-level care'",
      ],
      recommendations: [
        {
          id: "rec-1",
          text: "Obtain cardiology consult note before PA submission",
          priority: "high",
          status: "pending",
          category: "consultation",
          suggestedActions: [
            { id: "act-1", type: "request_consult", label: "Request Cardiology Consult", description: "Send consult request to cardiology department" },
            { id: "act-2", type: "send_message", label: "Message Cardiologist", description: "Send direct message to on-call cardiologist" },
          ],
        },
        {
          id: "rec-2",
          text: "Document specific discharge criteria being monitored",
          priority: "medium",
          status: "pending",
          category: "documentation",
          suggestedActions: [
            { id: "act-3", type: "add_documentation", label: "Add Discharge Criteria Note", description: "Open documentation template for discharge criteria" },
            { id: "act-4", type: "review_case", label: "Review Current Notes", description: "View existing documentation to identify gaps" },
          ],
        },
        {
          id: "rec-3",
          text: "Add medication reconciliation to support continued stay",
          priority: "medium",
          status: "pending",
          category: "documentation",
          suggestedActions: [
            { id: "act-5", type: "add_documentation", label: "Complete Med Rec Form", description: "Open medication reconciliation form" },
            { id: "act-6", type: "send_message", label: "Request Pharmacy Review", description: "Send request to pharmacy for medication review" },
          ],
        },
      ],
      auditTrail: [
        { id: "1", timestamp: "Jan 7, 2026 09:15", action: "Clinical Summary generated", user: "AI System" },
        { id: "2", timestamp: "Jan 7, 2026 09:16", action: "CareLens analysis completed", user: "AI System" },
        { id: "3", timestamp: "Jan 7, 2026 10:30", action: "Summary accessed", user: "Dr. Jane Doe" },
      ],
    },
  },
  {
    id: "2",
    name: "Michael Chen",
    mrn: "MRN-892348",
    age: 54,
    gender: "M",
    dob: "08/22/1971",
    ssn: "***-**-7832",
    insurance: "Blue Cross Blue Shield",
    admitted: "5 days ago",
    admissionDate: "Jan 2, 2026",
    room: "412-B",
    urgency: "URGENT",
    tasks: 2,
    lengthOfStay: "5 days",
    chiefComplaint: "Post-operative wound infection following abdominal surgery",
    diagnoses: ["Surgical site infection", "Post-operative ileus", "Type 2 diabetes"],
    medications:
      "Vancomycin 1g IV q12h, Piperacillin-tazobactam 4.5g IV q8h, Insulin sliding scale, Metformin 1000mg PO BID",
    clinicalCourse:
      "Patient developed fever and wound drainage on POD 3 following exploratory laparotomy. CT shows fluid collection at surgical site. Cultures grew MRSA. Started on IV antibiotics. Wound care daily. No systemic sepsis. Patient improving clinically.",
    timeline: [
      {
        id: "1",
        timestamp: "Jan 2, 2026 09:00",
        title: "Post-Op Transfer",
        description: "Transferred from PACU to surgical floor. Vital signs stable. Pain controlled with PCA",
      },
      {
        id: "2",
        timestamp: "Jan 5, 2026 15:20",
        title: "Fever Spike",
        description: "Temperature 101.8°F. Wound assessment shows erythema and purulent drainage. Blood cultures drawn",
      },
      {
        id: "3",
        timestamp: "Jan 6, 2026 10:00",
        title: "Antibiotic Initiated",
        description: "Started on broad-spectrum IV antibiotics pending culture results. Wound care protocol initiated",
      },
    ],
    alerts: [
      {
        id: "1",
        message: "Need updated surgical note with antibiotic justification",
        type: "warning",
      },
    ],
    documentsProcessed: 9,
    problemList: [
      { id: "1", name: "Surgical Site Infection (MRSA)", icdCode: "T81.41XA", type: "primary", status: "active" },
      { id: "2", name: "Post-operative Ileus", icdCode: "K91.89", type: "secondary", status: "active" },
      { id: "3", name: "Type 2 Diabetes Mellitus", icdCode: "E11.9", type: "comorbidity", status: "chronic" },
    ],
    payerRules: [
      { id: "1", rule: "Culture results documenting infection", status: "satisfied", evidence: "Microbiology report" },
      { id: "2", rule: "IV antibiotic medical necessity", status: "missing" },
      { id: "3", rule: "Wound care documentation daily", status: "satisfied", evidence: "Nursing notes" },
      { id: "4", rule: "Surgical follow-up documented", status: "unclear" },
    ],
    careLens: {
      overallConfidence: "Medium",
      confidenceBreakdown: {
        evidenceCompleteness: "Medium",
        policyAlignment: "Low",
        clinicalClarity: "High",
      },
      denialRisk: "High",
      riskFactors: [
        { 
          id: "rf-3", 
          factor: "Extended LOS without step-down plan", 
          severity: "High", 
          mitigation: "Document transition to oral antibiotics criteria",
          status: "open",
          explanation: "Patient is on day 5 with IV antibiotics but no documented plan for oral transition. BCBS policy requires step-down criteria documentation by day 3 for surgical site infections.",
          evidenceLinks: ["Surgical Note - Jan 2", "Antibiotic Orders", "Culture Results"],
          suggestedActions: [
            { id: "rfa-5", type: "create_plan", label: "Define Step-Down Plan", description: "Document oral antibiotic regimen, criteria, and planned transition date" },
            { id: "rfa-6", type: "add_documentation", label: "Add Transition Criteria", description: "Document specific clinical markers for oral transition readiness" },
          ]
        },
        { 
          id: "rf-4", 
          factor: "Missing IV antibiotic justification note", 
          severity: "High", 
          mitigation: "Obtain infectious disease consult",
          status: "open",
          explanation: "IV antibiotics require physician justification documenting why oral alternatives are not appropriate. This is a high-priority payer requirement for continued approval.",
          evidenceLinks: ["Microbiology Report", "Wound Care Notes"],
          suggestedActions: [
            { id: "rfa-7", type: "request_consult", label: "Request ID Consult", description: "Submit infectious disease consult for antibiotic management" },
            { id: "rfa-8", type: "add_documentation", label: "Draft IV Justification", description: "Create justification note for surgical attending review" },
          ]
        },
      ],
      policyGaps: [
        { 
          id: "pg-3", 
          gap: "IV antibiotic justification not documented by physician", 
          status: "open",
          policyReference: "BCBS Medical Policy MP-2024-045: IV Antibiotic Medical Necessity",
          relatedNotes: ["Surgical Progress Notes", "Pharmacy Consult"],
        },
        { 
          id: "pg-4", 
          gap: "No documented criteria for transition to oral therapy", 
          status: "open",
          policyReference: "Hospital Antimicrobial Stewardship Protocol ASP-001",
          relatedNotes: ["ID Recommendations", "Culture Sensitivities"],
        },
      ],
      conflictingNotes: [],
      recommendations: [
        {
          id: "rec-4",
          text: "Request surgical attending note with IV antibiotic justification",
          priority: "high",
          status: "pending",
          category: "documentation",
          suggestedActions: [
            { id: "act-7", type: "send_message", label: "Message Surgical Attending", description: "Request note from surgical attending" },
            { id: "act-8", type: "add_documentation", label: "Draft Justification Note", description: "Create draft justification for review" },
          ],
        },
        {
          id: "rec-5",
          text: "Document specific clinical markers for oral antibiotic transition",
          priority: "high",
          status: "pending",
          category: "clinical",
          suggestedActions: [
            { id: "act-9", type: "add_documentation", label: "Add Transition Criteria", description: "Document oral antibiotic transition criteria" },
            { id: "act-10", type: "order_test", label: "Order Follow-up Labs", description: "Order labs to monitor transition readiness" },
          ],
        },
        {
          id: "rec-6",
          text: "Consider infectious disease consult for complex MRSA management",
          priority: "medium",
          status: "pending",
          category: "consultation",
          suggestedActions: [
            { id: "act-11", type: "request_consult", label: "Request ID Consult", description: "Submit consult request to infectious disease" },
            { id: "act-12", type: "review_case", label: "Review MRSA Protocol", description: "View hospital MRSA management protocol" },
          ],
        },
      ],
      auditTrail: [
        { id: "1", timestamp: "Jan 7, 2026 08:00", action: "Clinical Summary generated", user: "AI System" },
        { id: "2", timestamp: "Jan 7, 2026 08:01", action: "High denial risk flagged", user: "CareLens" },
      ],
    },
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    mrn: "MRN-891923",
    age: 42,
    gender: "F",
    dob: "11/03/1983",
    ssn: "***-**-1923",
    insurance: "United Healthcare",
    admitted: "1 day ago",
    admissionDate: "Jan 6, 2026",
    room: "218-A",
    urgency: "ROUTINE",
    tasks: 1,
    lengthOfStay: "1 day",
    chiefComplaint: "Severe migraine headache unresponsive to outpatient management",
    diagnoses: ["Status migrainosus", "Medication overuse headache"],
    medications: "DHE protocol, Prochlorperazine 10mg IV q6h PRN, IV fluids at 125mL/hr, Magnesium sulfate 2g IV",
    clinicalCourse:
      "Patient with history of chronic migraines presenting with 72-hour continuous headache despite home medications. Admitted for IV migraine protocol. Responding well to DHE treatment. Pain score decreased from 9/10 to 4/10. Tolerating PO intake. Plan for discharge today with outpatient neurology follow-up.",
    timeline: [
      {
        id: "1",
        timestamp: "Jan 6, 2026 11:00",
        title: "ED Arrival",
        description: "Patient arrived via private vehicle. Pain score 9/10. Photophobia and phonophobia present",
      },
      {
        id: "2",
        timestamp: "Jan 6, 2026 13:30",
        title: "Treatment Started",
        description: "DHE protocol initiated. IV hydration started. Antiemetic given with good effect",
      },
      {
        id: "3",
        timestamp: "Jan 7, 2026 08:00",
        title: "Clinical Improvement",
        description: "Pain reduced to 4/10. Tolerating breakfast. Discharge planning initiated",
      },
    ],
    alerts: [],
    documentsProcessed: 5,
    problemList: [
      { id: "1", name: "Status Migrainosus", icdCode: "G43.911", type: "primary", status: "active" },
      { id: "2", name: "Medication Overuse Headache", icdCode: "G44.40", type: "secondary", status: "active" },
    ],
    payerRules: [
      { id: "1", rule: "Failed outpatient treatment documented", status: "satisfied", evidence: "ED triage notes" },
      { id: "2", rule: "IV medication medical necessity", status: "satisfied", evidence: "Clinical notes" },
      { id: "3", rule: "Neurology follow-up scheduled", status: "satisfied", evidence: "Discharge plan" },
    ],
    careLens: {
      overallConfidence: "High",
      confidenceBreakdown: {
        evidenceCompleteness: "High",
        policyAlignment: "High",
        clinicalClarity: "High",
      },
      denialRisk: "Low",
      riskFactors: [] as any[],
      policyGaps: [] as any[],
      conflictingNotes: [],
      recommendations: [
        {
          id: "rec-7",
          text: "Case ready for PA submission",
          priority: "low",
          status: "pending",
          category: "administrative",
          suggestedActions: [
            { id: "act-13", type: "review_case", label: "Review & Submit PA", description: "Final review before prior auth submission" },
          ],
        },
        {
          id: "rec-8",
          text: "Ensure discharge summary includes outpatient follow-up plan",
          priority: "low",
          status: "pending",
          category: "documentation",
          suggestedActions: [
            { id: "act-14", type: "add_documentation", label: "Add Follow-up Plan", description: "Document outpatient follow-up details" },
            { id: "act-15", type: "schedule_followup", label: "Schedule Appointment", description: "Schedule neurology follow-up appointment" },
          ],
        },
      ],
      auditTrail: [
        { id: "1", timestamp: "Jan 7, 2026 09:00", action: "Clinical Summary generated", user: "AI System" },
        { id: "2", timestamp: "Jan 7, 2026 09:01", action: "Low denial risk - ready for submission", user: "CareLens" },
      ],
    },
  },
]

interface AppContextType {
  patients: Patient[]
  selectedPatientId: string | null
  selectedPatient: Patient | null
  selectedFilter: string
  statusFilter: CaseStatus | "ALL"
  activeView: string
  currentRole: UserRole
  currentUser: { name: string; role: UserRole }
  // Mobile UI state
  patientListOpen: boolean
  setPatientListOpen: (open: boolean) => void
  careLensOpen: boolean
  setCareLensOpen: (open: boolean) => void
  hasSeenSwipeHint: boolean
  setHasSeenSwipeHint: (seen: boolean) => void
  setSelectedPatientId: (id: string) => void
  setSelectedFilter: (filter: string) => void
  setStatusFilter: (status: CaseStatus | "ALL") => void
  setActiveView: (view: string) => void
  setCurrentRole: (role: UserRole) => void
  // Workflow actions
  claimCase: (patientId: string) => void
  unclaimCase: (patientId: string) => void
  updateCaseStatus: (patientId: string, newStatus: CaseStatus, notes?: string) => void
  sendToPhysician: (patientId: string, notes?: string) => void
  physicianApprove: (patientId: string, notes?: string) => void
  physicianDefer: (patientId: string, notes?: string) => void
  physicianEscalate: (patientId: string, notes?: string) => void
  submitPA: (patientId: string) => void
  // Existing actions
  regenerateSummary: () => void
  requestDocumentation: (alertId: string) => void
  updateRecommendationStatus: (recommendationId: string, status: RecommendationStatus, notes?: string) => void
  executeRecommendationAction: (recommendationId: string, actionId: string) => Promise<{ success: boolean; message: string }>
  updateRiskFactorStatus: (riskFactorId: string, status: RiskFactorStatus, notes?: string) => void
  executeRiskFactorAction: (riskFactorId: string, actionId: string) => Promise<{ success: boolean; message: string }>
  updatePolicyGapStatus: (policyGapId: string, status: PolicyGapStatus, notes?: string) => void
  // Permission & audit system
  hasPermission: (permission: Permission) => boolean
  logAction: (action: string, patientId?: string) => void
  auditLog: AuditEntry[]
  // Audit stats
  getAuditStats: () => AuditStats
}

interface AuditStats {
  totalCases: number
  byStatus: Record<CaseStatus, number>
  avgProcessingTime: string
  approvalRate: number
  denialRate: number
  pendingPhysician: number
  readyForSubmission: number
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Add workflow data to all patients
const addWorkflowToPatients = (patients: Omit<Patient, "workflow">[]): Patient[] => {
  return patients.map((patient, index) => ({
    ...patient,
    workflow: generateWorkflow(patient, index),
  }))
}

// Combine original mock patients with generated patients and edge cases for 65+ total cases
const combinedPatients: Patient[] = addWorkflowToPatients([...mockPatients as Omit<Patient, "workflow">[], ...allPatients as Omit<Patient, "workflow">[], ...edgeCasePatients as Omit<Patient, "workflow">[]])

// Mock users for different roles
const mockUsers: Record<UserRole, { name: string; role: UserRole }> = {
  case_manager: { name: "Maria Santos", role: "case_manager" },
  physician: { name: "Dr. Robert Kim", role: "physician" },
  auditor: { name: "Jennifer Walsh", role: "auditor" },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(combinedPatients)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>("1")
  const [selectedFilter, setSelectedFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "ALL">("ALL")
  const [activeView, setActiveView] = useState("/")
  const [currentRole, setCurrentRole] = useState<UserRole>("case_manager")
  
  // Mobile UI state
  const [patientListOpen, setPatientListOpen] = useState(false)
  const [careLensOpen, setCareLensOpen] = useState(false)
  const [hasSeenSwipeHint, setHasSeenSwipeHint] = useState(false)
  
  const currentUser = mockUsers[currentRole]

  // Permission system
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return ROLE_PERMISSIONS[currentRole].includes(permission)
    },
    [currentRole]
  )

  const logAction = useCallback(
    (action: string, patientId?: string) => {
      const entry: AuditEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        action,
        user: currentUser.name,
        role: currentRole,
        patientId,
      }
      setAuditLog((prev) => [entry, ...prev])
    },
    [currentUser.name, currentRole]
  )

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null

  const regenerateSummary = () => {
    console.log("[v0] Regenerating clinical summary for patient:", selectedPatientId)
    // In a real app, this would call an API
  }

  const requestDocumentation = (alertId: string) => {
    console.log("[v0] Requesting documentation for alert:", alertId)
    // In a real app, this would send a request
  }

  const updateRecommendationStatus = (recommendationId: string, status: RecommendationStatus, notes?: string) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => ({
        ...patient,
        careLens: {
          ...patient.careLens,
          recommendations: patient.careLens.recommendations.map((rec) =>
            rec.id === recommendationId
              ? {
                  ...rec,
                  status,
                  notes: notes || rec.notes,
                  completedAt: status === "completed" ? new Date().toISOString() : rec.completedAt,
                  completedBy: status === "completed" ? "Dr. Current User" : rec.completedBy,
                }
              : rec
          ),
          auditTrail: patient.careLens.recommendations.find((r) => r.id === recommendationId)
            ? [
                {
                  id: `audit-${Date.now()}`,
                  timestamp: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  action: `Recommendation ${status}: ${patient.careLens.recommendations.find((r) => r.id === recommendationId)?.text.substring(0, 40)}...`,
                  user: "Dr. Current User",
                },
                ...patient.careLens.auditTrail,
              ]
            : patient.careLens.auditTrail,
        },
      }))
    )
  }

  const executeRecommendationAction = async (
    recommendationId: string,
    actionId: string
  ): Promise<{ success: boolean; message: string }> => {
    // Simulate async action execution
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find the recommendation and action
    const patient = patients.find((p) =>
      p.careLens.recommendations.some((r) => r.id === recommendationId)
    )
    const recommendation = patient?.careLens.recommendations.find((r) => r.id === recommendationId)
    const action = recommendation?.suggestedActions.find((a) => a.id === actionId)

    if (!action) {
      return { success: false, message: "Action not found" }
    }

    // Update recommendation status to in_progress
    updateRecommendationStatus(recommendationId, "in_progress")

    // In a real app, this would trigger the actual action (API calls, notifications, etc.)
    const actionMessages: Record<string, string> = {
      request_consult: "Consult request has been submitted successfully. The specialist will be notified.",
      add_documentation: "Documentation template has been opened. Please complete the required fields.",
      order_test: "Lab/test order has been placed. Results will be available in the patient chart.",
      schedule_followup: "Follow-up appointment scheduling initiated. Check the scheduling system.",
      send_message: "Message has been sent to the recipient. You will be notified of any replies.",
      review_case: "Case review panel has been opened with all relevant documentation.",
    }

    return {
      success: true,
      message: actionMessages[action.type] || "Action completed successfully.",
    }
  }

  const updateRiskFactorStatus = (riskFactorId: string, status: RiskFactorStatus, notes?: string) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => ({
        ...patient,
        careLens: {
          ...patient.careLens,
          riskFactors: patient.careLens.riskFactors.map((rf) =>
            rf.id === riskFactorId
              ? { ...rf, status }
              : rf
          ),
          auditTrail: patient.careLens.riskFactors.find((r) => r.id === riskFactorId)
            ? [
                {
                  id: `audit-${Date.now()}`,
                  timestamp: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  action: `Risk factor ${status}: ${patient.careLens.riskFactors.find((r) => r.id === riskFactorId)?.factor.substring(0, 40)}...`,
                  user: "Dr. Current User",
                },
                ...patient.careLens.auditTrail,
              ]
            : patient.careLens.auditTrail,
        },
      }))
    )
  }

  const executeRiskFactorAction = async (
    riskFactorId: string,
    actionId: string
  ): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const patient = patients.find((p) =>
      p.careLens.riskFactors.some((r) => r.id === riskFactorId)
    )
    const riskFactor = patient?.careLens.riskFactors.find((r) => r.id === riskFactorId)
    const action = riskFactor?.suggestedActions?.find((a) => a.id === actionId)

    if (!action) {
      return { success: false, message: "Action not found" }
    }

    const actionMessages: Record<string, string> = {
      create_plan: "Step-down plan workspace has been opened. Please define the transition criteria.",
      add_documentation: "Documentation template has been opened. Please complete the required fields.",
      request_consult: "Consult request has been submitted successfully. The specialist will be notified.",
      order_test: "Lab/test order has been placed. Results will be available in the patient chart.",
    }

    return {
      success: true,
      message: actionMessages[action.type] || "Action completed successfully.",
    }
  }

  const updatePolicyGapStatus = (policyGapId: string, status: PolicyGapStatus, notes?: string) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => ({
        ...patient,
        careLens: {
          ...patient.careLens,
          policyGaps: patient.careLens.policyGaps.map((pg) =>
            pg.id === policyGapId
              ? { ...pg, status, resolutionNotes: notes || pg.resolutionNotes }
              : pg
          ),
          auditTrail: patient.careLens.policyGaps.find((p) => p.id === policyGapId)
            ? [
                {
                  id: `audit-${Date.now()}`,
                  timestamp: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  action: `Policy gap ${status}: ${patient.careLens.policyGaps.find((p) => p.id === policyGapId)?.gap.substring(0, 40)}...`,
                  user: currentUser.name,
                },
                ...patient.careLens.auditTrail,
              ]
            : patient.careLens.auditTrail,
        },
      }))
    )
  }

  // Workflow Actions
  const claimCase = (patientId: string) => {
    logAction("Case claimed", patientId)
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              workflow: {
                ...p.workflow,
                status: "in_progress" as CaseStatus,
                assignment: {
                  assignedTo: currentUser.name,
                  assignedAt: new Date().toISOString(),
                  role: currentRole,
                },
                statusHistory: [
                  ...p.workflow.statusHistory,
                  {
                    from: p.workflow.status,
                    to: "in_progress" as CaseStatus,
                    changedBy: currentUser.name,
                    changedAt: new Date().toISOString(),
                    notes: "Case claimed",
                  },
                ],
                lastUpdated: new Date().toISOString(),
              },
            }
          : p
      )
    )
  }

  const unclaimCase = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              workflow: {
                ...p.workflow,
                status: "new" as CaseStatus,
                assignment: undefined,
                statusHistory: [
                  ...p.workflow.statusHistory,
                  {
                    from: p.workflow.status,
                    to: "new" as CaseStatus,
                    changedBy: currentUser.name,
                    changedAt: new Date().toISOString(),
                    notes: "Case released",
                  },
                ],
                lastUpdated: new Date().toISOString(),
              },
            }
          : p
      )
    )
  }

  const updateCaseStatus = (patientId: string, newStatus: CaseStatus, notes?: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              workflow: {
                ...p.workflow,
                status: newStatus,
                statusHistory: [
                  ...p.workflow.statusHistory,
                  {
                    from: p.workflow.status,
                    to: newStatus,
                    changedBy: currentUser.name,
                    changedAt: new Date().toISOString(),
                    notes,
                  },
                ],
                lastUpdated: new Date().toISOString(),
                progressPercent: calculateProgress(p),
                readyForPA: isReadyForPA(p),
              },
            }
          : p
      )
    )
  }

  const sendToPhysician = (patientId: string, notes?: string) => {
    logAction("Sent to physician for review", patientId)
    updateCaseStatus(patientId, "needs_physician", notes || "Sent to physician for review and approval")
  }

  const physicianApprove = (patientId: string, notes?: string) => {
    logAction("Physician approved PA", patientId)
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              workflow: {
                ...p.workflow,
                status: "ready" as CaseStatus,
                physicianDecision: {
                  decision: "approved",
                  decidedBy: currentUser.name,
                  decidedAt: new Date().toISOString(),
                  notes,
                },
                statusHistory: [
                  ...p.workflow.statusHistory,
                  {
                    from: p.workflow.status,
                    to: "ready" as CaseStatus,
                    changedBy: currentUser.name,
                    changedAt: new Date().toISOString(),
                    notes: notes || "Physician approved for PA submission",
                  },
                ],
                lastUpdated: new Date().toISOString(),
              },
            }
          : p
      )
    )
  }

  const physicianDefer = (patientId: string, notes?: string) => {
    logAction("Physician deferred - additional documentation needed", patientId)
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              workflow: {
                ...p.workflow,
                status: "in_progress" as CaseStatus,
                physicianDecision: {
                  decision: "deferred",
                  decidedBy: currentUser.name,
                  decidedAt: new Date().toISOString(),
                  notes,
                },
                statusHistory: [
                  ...p.workflow.statusHistory,
                  {
                    from: p.workflow.status,
                    to: "in_progress" as CaseStatus,
                    changedBy: currentUser.name,
                    changedAt: new Date().toISOString(),
                    notes: notes || "Deferred - additional documentation needed",
                  },
                ],
                lastUpdated: new Date().toISOString(),
              },
            }
          : p
      )
    )
  }

  const physicianEscalate = (patientId: string, notes?: string) => {
    logAction("Physician escalated to medical director", patientId)
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              workflow: {
                ...p.workflow,
                status: "in_progress" as CaseStatus,
                physicianDecision: {
                  decision: "escalated",
                  decidedBy: currentUser.name,
                  decidedAt: new Date().toISOString(),
                  notes,
                },
                statusHistory: [
                  ...p.workflow.statusHistory,
                  {
                    from: p.workflow.status,
                    to: "in_progress" as CaseStatus,
                    changedBy: currentUser.name,
                    changedAt: new Date().toISOString(),
                    notes: notes || "Escalated to medical director",
                  },
                ],
                lastUpdated: new Date().toISOString(),
              },
            }
          : p
      )
    )
  }

  const submitPA = (patientId: string) => {
    logAction("PA submitted to payer", patientId)
    updateCaseStatus(patientId, "submitted", "PA submitted to payer")
  }

  const getAuditStats = (): AuditStats => {
    const byStatus = patients.reduce((acc, p) => {
      acc[p.workflow.status] = (acc[p.workflow.status] || 0) + 1
      return acc
    }, {} as Record<CaseStatus, number>)

    const approved = byStatus.approved || 0
    const denied = byStatus.denied || 0
    const total = approved + denied

    return {
      totalCases: patients.length,
      byStatus,
      avgProcessingTime: "2.4 days",
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      denialRate: total > 0 ? Math.round((denied / total) * 100) : 0,
      pendingPhysician: byStatus.needs_physician || 0,
      readyForSubmission: byStatus.ready || 0,
    }
  }

  return (
    <AppContext.Provider
      value={{
        patients,
        selectedPatientId,
        selectedPatient,
        selectedFilter,
        statusFilter,
        activeView,
        currentRole,
        currentUser,
        patientListOpen,
        setPatientListOpen,
        careLensOpen,
        setCareLensOpen,
        hasSeenSwipeHint,
        setHasSeenSwipeHint,
        setSelectedPatientId,
        setSelectedFilter,
        setStatusFilter,
        setActiveView,
        setCurrentRole,
        hasPermission,
        logAction,
        auditLog,
        claimCase,
        unclaimCase,
        updateCaseStatus,
        sendToPhysician,
        physicianApprove,
        physicianDefer,
        physicianEscalate,
        submitPA,
        regenerateSummary,
        requestDocumentation,
        updateRecommendationStatus,
        executeRecommendationAction,
        updateRiskFactorStatus,
        executeRiskFactorAction,
        updatePolicyGapStatus,
        getAuditStats,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
