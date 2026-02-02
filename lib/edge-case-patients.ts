import type { Patient, RiskFactor, PolicyGap, Recommendation, AuditEntry, SDOHFactor, PADeadline, EditSession } from "./types"

const uid = () => Math.random().toString(36).substring(2, 9)

// ============================================
// EDGE CASE 1: "Data Desert" - Sparse Data
// Patient with only 1 triage note, no history
// ============================================
export const dataDesertPatient: Patient = {
  id: "edge-1",
  name: "Unknown Doe",
  mrn: "MRN-000001",
  age: 45,
  gender: "M",
  dob: "Unknown",
  ssn: "***-**-0000",
  insurance: "Unknown - Verification Pending",
  admitted: "Today",
  admissionDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "ED-Bay-7",
  urgency: "STAT",
  tasks: 8,
  lengthOfStay: "0 days",
  chiefComplaint: "Found unresponsive, no ID, no medical history available",
  diagnoses: ["Altered mental status", "Unknown medical history"],
  medications: "None documented",
  clinicalCourse: "Patient found unresponsive by EMS. No identification. No medical records found in regional HIE. Awaiting social work for identity verification.",
  timeline: [
    { id: uid(), timestamp: new Date().toLocaleTimeString(), title: "ED Arrival", description: "Brought in by EMS, unresponsive, no ID" }
  ],
  alerts: [
    { id: uid(), message: "CRITICAL: No patient identification", type: "error" },
    { id: uid(), message: "No medical history available", type: "error" },
    { id: uid(), message: "Insurance verification required", type: "warning" },
  ],
  documentsProcessed: 1,
  problemList: [
    { id: uid(), name: "Altered Mental Status", icdCode: "R41.82", type: "primary", status: "active" },
  ],
  payerRules: [
    { id: uid(), rule: "Patient identification verified", status: "missing" },
    { id: uid(), rule: "Insurance eligibility confirmed", status: "missing" },
    { id: uid(), rule: "Medical history documented", status: "missing" },
  ],
  edgeCaseType: "Data Desert",
  dataQuality: "sparse",
  careLens: {
    overallConfidence: "Low",
    confidenceBreakdown: {
      evidenceCompleteness: "Low",
      policyAlignment: "Low",
      clinicalClarity: "Low",
    },
    denialRisk: "High",
    riskFactors: [
      {
        id: "rf-edge1-1",
        factor: "No patient identification - cannot verify coverage",
        severity: "High",
        status: "open",
        explanation: "Without patient ID, insurance verification is impossible. All care may be uncompensated.",
        suggestedActions: [
          { id: uid(), type: "request_consult", label: "Request Social Work STAT", description: "Urgent identity verification needed" }
        ]
      },
      {
        id: "rf-edge1-2",
        factor: "No medical history - treatment decisions at risk",
        severity: "High",
        status: "open",
        explanation: "Unknown allergies, medications, comorbidities create safety and documentation risks.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Document Unknown Status", description: "Formally document that history is unavailable" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge1-1", gap: "Patient identity not verified", status: "open", policyReference: "Hospital Policy: Patient Identification Requirements" },
      { id: "pg-edge1-2", gap: "Insurance eligibility not confirmed", status: "open", policyReference: "Revenue Cycle Policy: Pre-Authorization Requirements" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge1-1",
        text: "URGENT: Initiate social work consult for patient identification",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "request_consult", label: "STAT Social Work", description: "Identity verification" }]
      },
      {
        id: "rec-edge1-2",
        text: "Document 'unknown' status formally in chart for all missing elements",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Document Unknown Status", description: "Create formal documentation" }]
      },
      {
        id: "rec-edge1-3",
        text: "AI cannot generate reliable summary - insufficient data",
        priority: "high",
        status: "pending",
        category: "clinical",
        suggestedActions: []
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: new Date().toLocaleTimeString(), action: "AI Summary attempted - INSUFFICIENT DATA", user: "AI System" },
      { id: uid(), timestamp: new Date().toLocaleTimeString(), action: "Confidence: LOW - Cannot reliably assess case", user: "CareLens" },
    ]
  }
}

// ============================================
// EDGE CASE 2: "Data Tsunami" - Excessive Data
// 500+ notes, 20 diagnoses, complex chronic case
// ============================================
export const dataTsunamiPatient: Patient = {
  id: "edge-2",
  name: "Martha Complexity",
  mrn: "MRN-999999",
  age: 78,
  gender: "F",
  dob: "3/15/1947",
  ssn: "***-**-9999",
  insurance: "Medicare Advantage",
  admitted: "12 days ago",
  admissionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "ICU-402-A",
  urgency: "STAT",
  tasks: 15,
  lengthOfStay: "12 days",
  chiefComplaint: "Multi-organ dysfunction, sepsis, CHF exacerbation, COPD exacerbation, AKI, hyperglycemic crisis",
  diagnoses: [
    "Sepsis", "CHF exacerbation", "COPD exacerbation", "Acute kidney injury", 
    "Type 2 DM with hyperglycemic crisis", "Atrial fibrillation", "Hypertension",
    "Chronic kidney disease Stage 3", "Hypothyroidism", "Osteoarthritis",
    "GERD", "Anemia of chronic disease", "Peripheral neuropathy", "Depression",
    "Urinary tract infection", "Pressure injury Stage 2", "Malnutrition",
    "Vitamin D deficiency", "Hyperlipidemia", "History of DVT"
  ],
  medications: "Vancomycin, Piperacillin-tazobactam, Insulin drip, Furosemide IV, Metoprolol, Amiodarone, Levothyroxine, Pantoprazole, Duloxetine, Acetaminophen, Heparin drip, Vitamin D, + 15 more home medications",
  clinicalCourse: "Extremely complex patient with 547 chart notes over 12-day admission. Multiple subspecialty consults (Cards, Pulm, Nephro, ID, Endo, Wound Care, Nutrition, PT/OT, SW). Daily multidisciplinary rounds. Multiple medication adjustments. Trending toward stability but significant documentation burden.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "ICU Admission", description: "Septic shock, intubated, pressors initiated" },
    { id: uid(), timestamp: "Day 3", title: "Extubation", description: "Weaned from vent, BIPAP" },
    { id: uid(), timestamp: "Day 5", title: "CHF Exacerbation", description: "Diuresis intensified, echo obtained" },
    { id: uid(), timestamp: "Day 8", title: "AKI Improvement", description: "Creatinine trending down, off dialysis" },
    { id: uid(), timestamp: "Day 10", title: "Stepdown Transfer", description: "Stable for ICU discharge, still complex" },
    { id: uid(), timestamp: "Day 12", title: "Current", description: "Awaiting SNF placement, 20+ active problems" },
  ],
  alerts: [
    { id: uid(), message: "547 documents to process - AI summarization limited", type: "warning" },
    { id: uid(), message: "20 active diagnoses - which is primary for PA?", type: "warning" },
    { id: uid(), message: "12 subspecialty consults - conflicting recommendations possible", type: "warning" },
    { id: uid(), message: "Concurrent review deadline in 6 hours", type: "error" },
  ],
  documentsProcessed: 547,
  problemList: [
    { id: uid(), name: "Sepsis", icdCode: "A41.9", type: "primary", status: "active" },
    { id: uid(), name: "Acute CHF exacerbation", icdCode: "I50.21", type: "primary", status: "active" },
    { id: uid(), name: "COPD with acute exacerbation", icdCode: "J44.1", type: "secondary", status: "active" },
    { id: uid(), name: "Acute kidney injury", icdCode: "N17.9", type: "secondary", status: "active" },
    { id: uid(), name: "T2DM with hyperglycemic crisis", icdCode: "E11.65", type: "secondary", status: "active" },
    // ... 15 more would be here
  ],
  payerRules: [
    { id: uid(), rule: "ICU level of care justified", status: "satisfied", evidence: "Multiple organ dysfunction" },
    { id: uid(), rule: "Subspecialty consults documented", status: "satisfied", evidence: "12 consult notes" },
    { id: uid(), rule: "Daily progress notes", status: "satisfied", evidence: "547 total documents" },
    { id: uid(), rule: "Concurrent review submitted", status: "missing" },
    { id: uid(), rule: "Discharge planning documented", status: "unclear" },
  ],
  edgeCaseType: "Data Tsunami",
  dataQuality: "excessive",
  paDeadline: {
    type: "concurrent",
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    hoursRemaining: 6,
    isWeekend: false,
    payerSLA: "24h concurrent review response",
    status: "at_risk"
  },
  careLens: {
    overallConfidence: "Medium",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Medium",
      clinicalClarity: "Low",
    },
    denialRisk: "Medium",
    riskFactors: [
      {
        id: "rf-edge2-1",
        factor: "Primary diagnosis unclear - 20 active problems",
        severity: "High",
        status: "open",
        explanation: "Payer requires clear primary diagnosis for continued stay. Multiple competing diagnoses create ambiguity.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Clarify Primary DX", description: "Attending to specify which diagnosis drives LOS" }
        ]
      },
      {
        id: "rf-edge2-2",
        factor: "547 documents - AI summarization accuracy degraded",
        severity: "Medium",
        status: "open",
        explanation: "Document volume exceeds optimal AI processing. Summary may miss recent changes.",
        suggestedActions: [
          { id: uid(), type: "review_case", label: "Manual Review Recommended", description: "Human verification of AI summary needed" }
        ]
      },
      {
        id: "rf-edge2-3",
        factor: "Concurrent review deadline in 6 hours",
        severity: "High",
        status: "open",
        explanation: "Payer concurrent review required every 3 days. Deadline approaching.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Submit Concurrent Review", description: "Prepare and submit continued stay request" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge2-1", gap: "Primary diagnosis for LOS not clearly documented", status: "open", policyReference: "Medicare Guidelines: Principal Diagnosis Selection" },
      { id: "pg-edge2-2", gap: "Concurrent review due in 6 hours", status: "open", policyReference: "Payer Contract: 72-hour review requirement" },
    ],
    conflictingNotes: [
      "Cardiology: 'CHF driving continued stay' vs Pulmonology: 'COPD exacerbation is primary issue'",
      "Nephrology: 'AKI resolved, no renal indication for stay' vs Medicine: 'Renal function still fragile'",
      "ID: 'Can transition to oral antibiotics' vs Surgery: 'Continue IV per wound appearance'"
    ],
    recommendations: [
      {
        id: "rec-edge2-1",
        text: "URGENT: Clarify primary diagnosis with attending - payer requires this for continued stay",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Message Attending", description: "Request primary DX clarification" }]
      },
      {
        id: "rec-edge2-2",
        text: "Submit concurrent review before 6-hour deadline",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Prepare Concurrent Review", description: "Compile documentation for payer" }]
      },
      {
        id: "rec-edge2-3",
        text: "Human verification recommended - document volume exceeds AI confidence threshold",
        priority: "medium",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "review_case", label: "Manual Summary Review", description: "Physician to verify AI summary accuracy" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Today 08:00", action: "AI processed 547 documents - VOLUME WARNING issued", user: "AI System" },
      { id: uid(), timestamp: "Today 08:01", action: "Conflicting subspecialty recommendations detected", user: "CareLens" },
      { id: uid(), timestamp: "Today 08:02", action: "Concurrent review deadline alert triggered", user: "AI System" },
    ]
  }
}

// ============================================
// EDGE CASE 3: "Insurance Limbo" - Dual Coverage
// Dual coverage with conflicting requirements
// ============================================
export const insuranceLimboPatient: Patient = {
  id: "edge-3",
  name: "Carlos Dualcoverage",
  mrn: "MRN-333333",
  age: 66,
  gender: "M",
  dob: "8/22/1959",
  ssn: "***-**-3333",
  insurance: "Medicare + Medicaid (Dual Eligible)",
  admitted: "3 days ago",
  admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "312-B",
  urgency: "URGENT",
  tasks: 5,
  lengthOfStay: "3 days",
  chiefComplaint: "Diabetic foot ulcer with osteomyelitis, requires IV antibiotics and surgical debridement",
  diagnoses: ["Diabetic foot ulcer", "Osteomyelitis", "Type 2 DM", "Peripheral vascular disease"],
  medications: "Vancomycin IV, Ertapenem IV, Insulin sliding scale, Gabapentin, Lisinopril",
  clinicalCourse: "Dual-eligible patient with Medicare primary and Medicaid secondary. Medicare requires PA for continued IV antibiotics >3 days. Medicaid has different SNF placement criteria. Payers have conflicting documentation requirements creating administrative complexity.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Admission", description: "Diabetic foot ulcer with suspected osteomyelitis" },
    { id: uid(), timestamp: "Day 2", title: "MRI Confirmed", description: "Osteomyelitis confirmed, surgery consulted" },
    { id: uid(), timestamp: "Day 3", title: "Debridement", description: "Surgical debridement performed, PICC placed for IV abx" },
  ],
  alerts: [
    { id: uid(), message: "DUAL COVERAGE: Medicare and Medicaid have conflicting PA requirements", type: "warning" },
    { id: uid(), message: "Medicare PA due in 12 hours", type: "warning" },
    { id: uid(), message: "Medicaid requires different discharge planning forms", type: "warning" },
  ],
  documentsProcessed: 23,
  problemList: [
    { id: uid(), name: "Diabetic foot ulcer with osteomyelitis", icdCode: "E11.621", type: "primary", status: "active" },
    { id: uid(), name: "Type 2 DM", icdCode: "E11.9", type: "comorbidity", status: "chronic" },
    { id: uid(), name: "Peripheral vascular disease", icdCode: "I73.9", type: "comorbidity", status: "chronic" },
  ],
  payerRules: [
    { id: uid(), rule: "Medicare: IV antibiotic necessity documented", status: "satisfied" },
    { id: uid(), rule: "Medicare: Surgery note with post-op requirements", status: "satisfied" },
    { id: uid(), rule: "Medicare: Continued stay criteria met", status: "missing" },
    { id: uid(), rule: "Medicaid: SNF level of care assessment", status: "missing" },
    { id: uid(), rule: "Medicaid: Home health eligibility screening", status: "missing" },
  ],
  edgeCaseType: "Insurance Limbo",
  dataQuality: "complete",
  paDeadline: {
    type: "initial",
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    hoursRemaining: 12,
    isWeekend: false,
    payerSLA: "Medicare: Initial PA within 72h",
    status: "at_risk"
  },
  careLens: {
    overallConfidence: "Medium",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Low",
      clinicalClarity: "High",
    },
    denialRisk: "Medium",
    riskFactors: [
      {
        id: "rf-edge3-1",
        factor: "Dual coverage - conflicting payer requirements",
        severity: "High",
        status: "open",
        explanation: "Medicare and Medicaid have different PA criteria. Must satisfy BOTH to ensure coverage.",
        suggestedActions: [
          { id: uid(), type: "review_case", label: "Review Both Payer Policies", description: "Compare Medicare and Medicaid requirements" }
        ]
      },
      {
        id: "rf-edge3-2",
        factor: "Medicare PA deadline in 12 hours",
        severity: "High",
        status: "open",
        explanation: "Medicare requires PA within 72h of admission. Deadline approaching.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Submit Medicare PA", description: "Prepare Medicare-specific PA request" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge3-1", gap: "Medicare continued stay criteria not documented", status: "open", policyReference: "Medicare LCD: Osteomyelitis IV Antibiotic Criteria" },
      { id: "pg-edge3-2", gap: "Medicaid discharge planning forms incomplete", status: "open", policyReference: "State Medicaid Manual: SNF/HH Placement" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge3-1",
        text: "Submit Medicare PA before 12-hour deadline",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Medicare PA", description: "Complete Medicare PA submission" }]
      },
      {
        id: "rec-edge3-2",
        text: "Complete Medicaid discharge planning forms separately",
        priority: "medium",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Medicaid Forms", description: "Complete state-specific forms" }]
      },
      {
        id: "rec-edge3-3",
        text: "Coordinate with both payer liaisons for discharge disposition",
        priority: "medium",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Contact Payer Liaisons", description: "Coordinate dual-coverage discharge" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 1 14:00", action: "Dual coverage identified - flagged for special handling", user: "AI System" },
      { id: uid(), timestamp: "Day 3 08:00", action: "Medicare PA deadline alert triggered (12h remaining)", user: "CareLens" },
    ]
  }
}

// ============================================
// EDGE CASE 4: "Policy Void" - Rare Disease
// Rare disease with no matching payer policy
// ============================================
export const policyVoidPatient: Patient = {
  id: "edge-4",
  name: "Priya Rarecondition",
  mrn: "MRN-444444",
  age: 32,
  gender: "F",
  dob: "5/10/1993",
  ssn: "***-**-4444",
  insurance: "Blue Cross Blue Shield",
  admitted: "5 days ago",
  admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "508-A",
  urgency: "URGENT",
  tasks: 6,
  lengthOfStay: "5 days",
  chiefComplaint: "Hereditary Angioedema type III acute attack with laryngeal involvement",
  diagnoses: ["Hereditary Angioedema Type III", "Acute laryngeal edema", "Respiratory distress"],
  medications: "Icatibant (Firazyr) SC, Berinert IV, Methylprednisolone, Epinephrine PRN",
  clinicalCourse: "Rare hereditary angioedema type III patient with acute laryngeal attack. Requires specialized treatment with C1-inhibitor concentrate. No standard payer policy exists for this rare disease. Medical necessity letter required.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "ED Presentation", description: "Severe facial and laryngeal swelling, difficulty breathing" },
    { id: uid(), timestamp: "Day 1", title: "ICU Transfer", description: "Emergent intubation standby, specialty medications obtained" },
    { id: uid(), timestamp: "Day 3", title: "Swelling Improved", description: "Off high-flow O2, able to speak" },
    { id: uid(), timestamp: "Day 5", title: "Current", description: "Stable, needs prophylaxis plan before discharge" },
  ],
  alerts: [
    { id: uid(), message: "NO PAYER POLICY EXISTS for Hereditary Angioedema Type III", type: "error" },
    { id: uid(), message: "Medical necessity letter required for orphan drug coverage", type: "warning" },
    { id: uid(), message: "Manual payer review required - no automated PA pathway", type: "warning" },
  ],
  documentsProcessed: 18,
  problemList: [
    { id: uid(), name: "Hereditary Angioedema Type III", icdCode: "D84.1", type: "primary", status: "active" },
    { id: uid(), name: "Acute laryngeal edema", icdCode: "J38.4", type: "secondary", status: "resolved" },
  ],
  payerRules: [
    { id: uid(), rule: "Standard PA pathway", status: "missing", evidence: "No policy exists" },
    { id: uid(), rule: "Medical necessity letter", status: "missing" },
    { id: uid(), rule: "Specialist attestation", status: "missing" },
    { id: uid(), rule: "Literature support for treatment", status: "missing" },
  ],
  edgeCaseType: "Policy Void",
  dataQuality: "complete",
  careLens: {
    overallConfidence: "Low",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Low",
      clinicalClarity: "High",
    },
    denialRisk: "High",
    riskFactors: [
      {
        id: "rf-edge4-1",
        factor: "No payer policy exists for this rare disease",
        severity: "High",
        status: "open",
        explanation: "Hereditary Angioedema Type III has no standard coverage criteria. Requires manual medical director review.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Draft Medical Necessity Letter", description: "Prepare comprehensive justification" }
        ]
      },
      {
        id: "rf-edge4-2",
        factor: "Orphan drug coverage requires special authorization",
        severity: "High",
        status: "open",
        explanation: "C1-inhibitor concentrate (Berinert) is an orphan drug with limited coverage pathways.",
        suggestedActions: [
          { id: uid(), type: "request_consult", label: "Request Immunology Letter", description: "Specialist to provide supporting documentation" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge4-1", gap: "No standard payer policy for HAE Type III - manual review required", status: "open", policyReference: "N/A - Policy does not exist" },
      { id: "pg-edge4-2", gap: "Orphan drug authorization pathway not established", status: "open", policyReference: "FDA Orphan Drug Designation: Berinert" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge4-1",
        text: "Draft comprehensive medical necessity letter citing peer-reviewed literature",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Medical Necessity Letter", description: "Create letter with literature citations" }]
      },
      {
        id: "rec-edge4-2",
        text: "Obtain immunology specialist attestation letter",
        priority: "high",
        status: "pending",
        category: "consultation",
        suggestedActions: [{ id: uid(), type: "request_consult", label: "Immunology Attestation", description: "Request specialist letter" }]
      },
      {
        id: "rec-edge4-3",
        text: "Request peer-to-peer with payer medical director",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Schedule P2P", description: "Arrange medical director call" }]
      },
      {
        id: "rec-edge4-4",
        text: "AI LIMITATION: Cannot auto-generate PA for rare disease without policy",
        priority: "medium",
        status: "pending",
        category: "clinical",
        suggestedActions: []
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 1 10:00", action: "Policy lookup failed - no matching criteria found", user: "AI System" },
      { id: uid(), timestamp: "Day 1 10:01", action: "Flagged for manual rare disease pathway", user: "CareLens" },
      { id: uid(), timestamp: "Day 3 14:00", action: "Medical necessity letter recommended", user: "CareLens" },
    ]
  }
}

// ============================================
// EDGE CASE 5: "Conflict Central" - Conflicting Notes
// 3 providers with conflicting diagnoses/plans
// ============================================
export const conflictCentralPatient: Patient = {
  id: "edge-5",
  name: "Robert Contradictus",
  mrn: "MRN-555555",
  age: 58,
  gender: "M",
  dob: "11/3/1967",
  ssn: "***-**-5555",
  insurance: "Aetna",
  admitted: "4 days ago",
  admissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "405-C",
  urgency: "URGENT",
  tasks: 7,
  lengthOfStay: "4 days",
  chiefComplaint: "Chest pain - Cardiology says ACS, GI says esophageal, Psych says anxiety-related",
  diagnoses: ["Chest pain - undifferentiated", "Possible ACS", "Possible esophageal spasm", "Possible anxiety disorder"],
  medications: "Aspirin, Heparin drip, Pantoprazole, Lorazepam PRN, Nitroglycerin SL PRN",
  clinicalCourse: "Patient admitted with chest pain. Three consultants have differing opinions on etiology. Cardiology recommends cath, GI recommends EGD, Psychiatry recommends anxiety management. Treatment plan unclear. Need consensus before PA submission.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "ED Admission", description: "Chest pain, elevated troponin (borderline), normal EKG" },
    { id: uid(), timestamp: "Day 2", title: "Cardiology Consult", description: "'Probable NSTEMI, recommend cath'" },
    { id: uid(), timestamp: "Day 2", title: "GI Consult", description: "'Symptoms more consistent with esophageal spasm'" },
    { id: uid(), timestamp: "Day 3", title: "Psychiatry Consult", description: "'Significant anxiety component, panic attacks likely'" },
    { id: uid(), timestamp: "Day 4", title: "Current", description: "No consensus, attending needs to reconcile opinions" },
  ],
  alerts: [
    { id: uid(), message: "CONFLICTING DIAGNOSES: 3 consultants disagree on primary etiology", type: "error" },
    { id: uid(), message: "Treatment plan unclear - cannot proceed with PA", type: "warning" },
    { id: uid(), message: "Attending reconciliation note required", type: "warning" },
  ],
  documentsProcessed: 32,
  problemList: [
    { id: uid(), name: "Chest pain, unspecified", icdCode: "R07.9", type: "primary", status: "active" },
    { id: uid(), name: "NSTEMI (suspected)", icdCode: "I21.4", type: "secondary", status: "active" },
    { id: uid(), name: "Esophageal spasm", icdCode: "K22.4", type: "secondary", status: "active" },
    { id: uid(), name: "Panic disorder", icdCode: "F41.0", type: "secondary", status: "active" },
  ],
  payerRules: [
    { id: uid(), rule: "Clear primary diagnosis documented", status: "missing" },
    { id: uid(), rule: "Consultant agreement on treatment plan", status: "missing" },
    { id: uid(), rule: "Attending reconciliation note", status: "missing" },
    { id: uid(), rule: "Procedure indication documented", status: "unclear" },
  ],
  edgeCaseType: "Conflict Central",
  dataQuality: "conflicting",
  careLens: {
    overallConfidence: "Low",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Low",
      clinicalClarity: "Low",
    },
    denialRisk: "High",
    riskFactors: [
      {
        id: "rf-edge5-1",
        factor: "Three consultants have conflicting diagnoses",
        severity: "High",
        status: "open",
        explanation: "Cardiology, GI, and Psychiatry disagree on primary etiology. Payer will deny if diagnosis is unclear.",
        suggestedActions: [
          { id: uid(), type: "send_message", label: "Request Care Conference", description: "Convene multidisciplinary meeting" }
        ]
      },
      {
        id: "rf-edge5-2",
        factor: "Treatment plan not agreed upon",
        severity: "High",
        status: "open",
        explanation: "Cannot submit PA without clear treatment plan. Cath vs EGD vs psych management undecided.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Attending Decision Note", description: "Document final treatment decision" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge5-1", gap: "Primary diagnosis not established", status: "open", policyReference: "Payer requires definitive primary diagnosis for PA" },
      { id: "pg-edge5-2", gap: "Treatment plan not documented", status: "open", policyReference: "Authorization requires clear treatment plan" },
    ],
    conflictingNotes: [
      "Cardiology (Day 2): 'Borderline troponin elevation with atypical symptoms. Recommend cardiac catheterization to rule out ACS.'",
      "GI (Day 2): 'History and symptom pattern more consistent with esophageal spasm. Recommend EGD before invasive cardiac workup.'",
      "Psychiatry (Day 3): 'Patient has significant anxiety with panic features. Chest pain episodes correlate with stress. Consider anxiety management as primary treatment.'"
    ],
    recommendations: [
      {
        id: "rec-edge5-1",
        text: "URGENT: Attending must reconcile conflicting consultant opinions",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Reconciliation Note", description: "Document final diagnosis and rationale" }]
      },
      {
        id: "rec-edge5-2",
        text: "Consider multidisciplinary care conference",
        priority: "high",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Schedule Conference", description: "Coordinate all three consultants" }]
      },
      {
        id: "rec-edge5-3",
        text: "AI cannot determine primary diagnosis - human decision required",
        priority: "high",
        status: "pending",
        category: "clinical",
        suggestedActions: []
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 2 16:00", action: "Conflicting consultant notes detected", user: "AI System" },
      { id: uid(), timestamp: "Day 3 09:00", action: "Third conflicting opinion added - escalated", user: "CareLens" },
      { id: uid(), timestamp: "Day 4 08:00", action: "AI LIMITATION: Cannot determine primary DX from conflicting data", user: "AI System" },
    ]
  }
}

// ============================================
// EDGE CASE 6: "Status Flip" - Observation to Inpatient
// Observation converted to inpatient mid-stay
// ============================================
export const statusFlipPatient: Patient = {
  id: "edge-6",
  name: "Diana Statuschange",
  mrn: "MRN-666666",
  age: 71,
  gender: "F",
  dob: "2/28/1954",
  ssn: "***-**-6666",
  insurance: "Medicare Traditional",
  admitted: "2 days ago (Obs), converted today",
  admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "218-A",
  urgency: "STAT",
  tasks: 6,
  lengthOfStay: "2 days (Obs) + 0 days (IP)",
  chiefComplaint: "Syncope - initially observation, now inpatient after pacemaker decision",
  diagnoses: ["Syncope", "Sick sinus syndrome", "Bradycardia", "Requires pacemaker"],
  medications: "Isoproterenol drip (bridge), Aspirin, Metoprolol held",
  clinicalCourse: "Patient admitted under observation for syncope workup. EP study today revealed sick sinus syndrome requiring permanent pacemaker. Status converted to inpatient. CRITICAL: Observation time does NOT count toward Medicare 3-day rule for SNF. PA documentation must clearly distinguish obs vs IP time.",
  timeline: [
    { id: uid(), timestamp: "Day 1 (Obs)", title: "Observation Admission", description: "Syncope workup, telemetry monitoring" },
    { id: uid(), timestamp: "Day 2 (Obs)", title: "EP Study", description: "Sick sinus syndrome confirmed" },
    { id: uid(), timestamp: "Day 2 (IP)", title: "Status Conversion", description: "Converted to inpatient for pacemaker implant" },
  ],
  alerts: [
    { id: uid(), message: "STATUS CONVERTED: Observation to Inpatient - retroactive PA required", type: "error" },
    { id: uid(), message: "Medicare 3-day rule: Observation days do NOT count toward SNF eligibility", type: "warning" },
    { id: uid(), message: "Observation documentation must be separated from inpatient documentation", type: "warning" },
  ],
  documentsProcessed: 15,
  problemList: [
    { id: uid(), name: "Sick sinus syndrome", icdCode: "I49.5", type: "primary", status: "active" },
    { id: uid(), name: "Syncope", icdCode: "R55", type: "secondary", status: "active" },
  ],
  payerRules: [
    { id: uid(), rule: "Inpatient status criteria met", status: "satisfied", evidence: "Pacemaker indication" },
    { id: uid(), rule: "Observation vs IP clearly documented", status: "missing" },
    { id: uid(), rule: "Retroactive IP authorization submitted", status: "missing" },
    { id: uid(), rule: "3-day rule calculation correct", status: "unclear" },
  ],
  edgeCaseType: "Status Flip",
  dataQuality: "complete",
  paDeadline: {
    type: "urgent",
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    hoursRemaining: 4,
    isWeekend: false,
    payerSLA: "Retroactive IP conversion: 24h",
    status: "at_risk"
  },
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
        id: "rf-edge6-1",
        factor: "Observation to Inpatient conversion requires retroactive PA",
        severity: "High",
        status: "open",
        explanation: "Status change mid-stay requires specific documentation and retroactive authorization.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Conversion Justification", description: "Document criteria met for IP status" }
        ]
      },
      {
        id: "rf-edge6-2",
        factor: "Medicare 3-day rule impact on SNF eligibility",
        severity: "Medium",
        status: "open",
        explanation: "Patient may need SNF after pacemaker. Observation days don't count toward 3-day requirement.",
        suggestedActions: [
          { id: uid(), type: "review_case", label: "Calculate IP Days", description: "Verify 3-day rule eligibility" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge6-1", gap: "Retroactive inpatient authorization not submitted", status: "open", policyReference: "Medicare Benefit Policy Manual: Chapter 1" },
      { id: "pg-edge6-2", gap: "Observation/Inpatient time clearly delineated", status: "open", policyReference: "CMS Two-Midnight Rule" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge6-1",
        text: "Submit retroactive inpatient authorization within 24 hours",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Retroactive PA", description: "Submit IP conversion PA" }]
      },
      {
        id: "rec-edge6-2",
        text: "Document clear distinction between observation and inpatient time",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Status Timeline", description: "Document exact conversion time" }]
      },
      {
        id: "rec-edge6-3",
        text: "Calculate actual inpatient days for 3-day rule if SNF needed",
        priority: "medium",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "review_case", label: "3-Day Calculation", description: "Verify SNF eligibility" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 1 14:00", action: "Observation admission processed", user: "AI System" },
      { id: uid(), timestamp: "Day 2 11:00", action: "STATUS CHANGE: Observation -> Inpatient detected", user: "CareLens" },
      { id: uid(), timestamp: "Day 2 11:01", action: "Retroactive PA requirement triggered", user: "AI System" },
    ]
  }
}

// ============================================
// EDGE CASE 7: "AI Uncertainty" - 50% Confidence
// Case where AI genuinely cannot determine risk
// ============================================
export const aiUncertaintyPatient: Patient = {
  id: "edge-7",
  name: "Thomas Grayzone",
  mrn: "MRN-777777",
  age: 49,
  gender: "M",
  dob: "7/14/1976",
  ssn: "***-**-7777",
  insurance: "UnitedHealthcare",
  admitted: "3 days ago",
  admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "340-B",
  urgency: "URGENT",
  tasks: 4,
  lengthOfStay: "3 days",
  chiefComplaint: "Low back pain with radiculopathy - surgical vs conservative management equally supported",
  diagnoses: ["Lumbar radiculopathy", "L4-L5 disc herniation", "Low back pain"],
  medications: "Gabapentin, Cyclobenzaprine, Ibuprofen, Oxycodone PRN",
  clinicalCourse: "Patient with L4-L5 disc herniation and radiculopathy. MRI shows moderate herniation. Symptoms partially responsive to conservative management. Neurosurgery says 'reasonable candidate for surgery' but also 'conservative management equally valid.' AI cannot determine which pathway payer will approve.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Admission", description: "Severe radicular pain, failed outpatient management" },
    { id: uid(), timestamp: "Day 2", title: "MRI", description: "Moderate L4-L5 herniation with nerve impingement" },
    { id: uid(), timestamp: "Day 3", title: "Neurosurgery Consult", description: "'Either surgical or conservative path reasonable'" },
  ],
  alerts: [
    { id: uid(), message: "AI CONFIDENCE: 50% - Cannot reliably predict payer decision", type: "warning" },
    { id: uid(), message: "Both treatment pathways have equal evidence support", type: "warning" },
    { id: uid(), message: "Human clinical judgment required", type: "warning" },
  ],
  documentsProcessed: 19,
  problemList: [
    { id: uid(), name: "Lumbar radiculopathy", icdCode: "M54.16", type: "primary", status: "active" },
    { id: uid(), name: "L4-L5 disc herniation", icdCode: "M51.16", type: "secondary", status: "active" },
  ],
  payerRules: [
    { id: uid(), rule: "Conservative therapy trial documented", status: "satisfied" },
    { id: uid(), rule: "MRI findings documented", status: "satisfied" },
    { id: uid(), rule: "Surgical indication clearly stated", status: "unclear" },
    { id: uid(), rule: "Treatment plan specified", status: "missing" },
  ],
  edgeCaseType: "AI Uncertainty",
  dataQuality: "complete",
  careLens: {
    overallConfidence: "Low",
    confidenceBreakdown: {
      evidenceCompleteness: "Medium",
      policyAlignment: "Low",
      clinicalClarity: "Low",
    },
    denialRisk: "Medium",
    riskFactors: [
      {
        id: "rf-edge7-1",
        factor: "AI confidence at 50% - cannot reliably assess",
        severity: "Medium",
        status: "open",
        explanation: "Both surgical and conservative pathways have equal evidence. AI cannot predict payer preference with confidence.",
        suggestedActions: [
          { id: uid(), type: "review_case", label: "Human Review Required", description: "Physician to make treatment decision" }
        ]
      },
      {
        id: "rf-edge7-2",
        factor: "Treatment pathway not specified",
        severity: "High",
        status: "open",
        explanation: "Payer requires clear treatment plan. Cannot submit PA without surgical vs conservative decision.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Document Treatment Plan", description: "Specify surgical or conservative path" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge7-1", gap: "Treatment pathway (surgical vs conservative) not documented", status: "open", policyReference: "Payer requires treatment plan specification" },
    ],
    conflictingNotes: [
      "Neurosurgery: 'Patient is a reasonable surgical candidate, but conservative management with PT is also a valid option. Decision should be based on patient preference and response to continued conservative care.'"
    ],
    recommendations: [
      {
        id: "rec-edge7-1",
        text: "AI LIMITATION: Cannot recommend pathway - 50% confidence",
        priority: "high",
        status: "pending",
        category: "clinical",
        suggestedActions: []
      },
      {
        id: "rec-edge7-2",
        text: "Physician must decide: surgical vs conservative pathway",
        priority: "high",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Treatment Decision", description: "Document chosen pathway with rationale" }]
      },
      {
        id: "rec-edge7-3",
        text: "If surgery chosen, document failure of conservative therapy",
        priority: "medium",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Conservative Failure Note", description: "Document why surgery now indicated" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 1 10:00", action: "Case analysis initiated", user: "AI System" },
      { id: uid(), timestamp: "Day 3 14:00", action: "AI CONFIDENCE: 50% - Human decision required", user: "CareLens" },
      { id: uid(), timestamp: "Day 3 14:01", action: "Both pathways have equal historical approval rates", user: "AI System" },
    ]
  }
}

// ============================================
// EDGE CASE 8: "Override Required" - AI Wrong
// AI recommends action that doctor knows is incorrect
// ============================================
export const overrideRequiredPatient: Patient = {
  id: "edge-8",
  name: "Helen Expertknows",
  mrn: "MRN-888888",
  age: 62,
  gender: "F",
  dob: "9/5/1963",
  ssn: "***-**-8888",
  insurance: "Cigna",
  admitted: "2 days ago",
  admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "520-A",
  urgency: "URGENT",
  tasks: 3,
  lengthOfStay: "2 days",
  chiefComplaint: "Breast mass - AI flags as 'biopsy not indicated per screening guidelines' but patient has BRCA1 mutation",
  diagnoses: ["Breast mass", "BRCA1 mutation carrier", "Family history breast cancer"],
  medications: "None related to current admission",
  clinicalCourse: "Patient with new breast mass. AI correctly notes that per standard screening guidelines, mass characteristics suggest observation. HOWEVER, patient is BRCA1 positive with strong family history - this context changes the clinical decision. AI recommendation should be overridden.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Admission", description: "Palpable breast mass found on self-exam" },
    { id: uid(), timestamp: "Day 1", title: "Mammogram/US", description: "BIRADS 3 - probably benign" },
    { id: uid(), timestamp: "Day 2", title: "Genetics Review", description: "BRCA1 positive - changes risk calculus" },
  ],
  alerts: [
    { id: uid(), message: "AI RECOMMENDATION MAY BE INCORRECT for this patient", type: "error" },
    { id: uid(), message: "Standard guidelines do not apply to BRCA1 carriers", type: "warning" },
    { id: uid(), message: "Physician override workflow available", type: "warning" },
  ],
  documentsProcessed: 12,
  problemList: [
    { id: uid(), name: "Breast mass", icdCode: "N63.10", type: "primary", status: "active" },
    { id: uid(), name: "BRCA1 mutation carrier", icdCode: "Z15.01", type: "secondary", status: "chronic" },
  ],
  payerRules: [
    { id: uid(), rule: "Biopsy indication per guidelines", status: "unclear", evidence: "BIRADS 3 typically = observation" },
    { id: uid(), rule: "High-risk patient status documented", status: "satisfied", evidence: "BRCA1 positive" },
    { id: uid(), rule: "Genetic risk documented", status: "satisfied" },
  ],
  edgeCaseType: "Override Required",
  dataQuality: "complete",
  careLens: {
    overallConfidence: "Medium",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Medium",
      clinicalClarity: "Medium",
    },
    denialRisk: "Low",
    riskFactors: [
      {
        id: "rf-edge8-1",
        factor: "AI recommendation may not account for genetic risk",
        severity: "High",
        status: "open",
        explanation: "Standard BIRADS guidelines suggest observation, but BRCA1 status significantly changes risk profile. Physician should override if biopsy indicated.",
        suggestedActions: [
          { id: uid(), type: "review_case", label: "Override AI Recommendation", description: "Document clinical rationale for biopsy" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge8-1", gap: "Biopsy indication for high-risk patient", status: "in_progress", policyReference: "NCCN Guidelines: High-Risk Breast Cancer Screening" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge8-1",
        text: "Per standard BIRADS 3 guidelines: 6-month follow-up imaging recommended",
        priority: "medium",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Follow Standard Path", description: "Schedule 6-month follow-up" }],
        notes: "AI RECOMMENDATION - MAY NEED OVERRIDE FOR BRCA1 PATIENT"
      },
      {
        id: "rec-edge8-2",
        text: "PHYSICIAN OVERRIDE OPTION: If clinical judgment supports biopsy for BRCA1 patient, override above recommendation",
        priority: "high",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Document Override Rationale", description: "Explain why BRCA1 status warrants biopsy" }]
      },
      {
        id: "rec-edge8-3",
        text: "Document BRCA1 status prominently in PA submission",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Highlight Genetic Risk", description: "Ensure payer sees BRCA1 status" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 1 15:00", action: "Standard BIRADS 3 recommendation generated", user: "AI System" },
      { id: uid(), timestamp: "Day 2 09:00", action: "BRCA1 status identified - recommendation may need override", user: "CareLens" },
      { id: uid(), timestamp: "Day 2 09:01", action: "Override workflow enabled for physician", user: "AI System" },
    ]
  }
}

// ============================================
// EDGE CASE 9: "Stale State" - PA Expired
// PA expired mid-stay, needs urgent re-auth
// ============================================
export const staleStatePatient: Patient = {
  id: "edge-9",
  name: "Victor Expiredauth",
  mrn: "MRN-999990",
  age: 55,
  gender: "M",
  dob: "4/18/1970",
  ssn: "***-**-9990",
  insurance: "Humana",
  admitted: "7 days ago",
  admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "602-B",
  urgency: "STAT",
  tasks: 2,
  lengthOfStay: "7 days",
  chiefComplaint: "Pneumonia with complications - initial 5-day PA expired, still hospitalized",
  diagnoses: ["Community-acquired pneumonia", "Pleural effusion", "Hypoxemic respiratory failure"],
  medications: "Ceftriaxone IV, Azithromycin IV, O2 supplementation, Albuterol nebs",
  clinicalCourse: "Patient with CAP, developed pleural effusion requiring drainage. Initial PA approved 5 days. Patient still hospitalized on day 7. PA EXPIRED 2 days ago. All care since expiration at risk for denial. URGENT re-authorization needed.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Admission", description: "Severe CAP, started on IV antibiotics" },
    { id: uid(), timestamp: "Day 3", title: "Pleural Effusion", description: "Effusion developed, thoracentesis performed" },
    { id: uid(), timestamp: "Day 5", title: "PA EXPIRED", description: "Initial 5-day authorization ended" },
    { id: uid(), timestamp: "Day 7", title: "Current", description: "Still hospitalized, 2 days without valid PA" },
  ],
  alerts: [
    { id: uid(), message: "CRITICAL: PA EXPIRED 2 DAYS AGO - All care at denial risk", type: "error" },
    { id: uid(), message: "Urgent re-authorization required", type: "error" },
    { id: uid(), message: "Document medical necessity for days 6-7 retroactively", type: "warning" },
  ],
  documentsProcessed: 28,
  problemList: [
    { id: uid(), name: "Community-acquired pneumonia", icdCode: "J18.9", type: "primary", status: "active" },
    { id: uid(), name: "Pleural effusion", icdCode: "J90", type: "secondary", status: "active" },
  ],
  payerRules: [
    { id: uid(), rule: "Initial PA (days 1-5)", status: "satisfied", evidence: "Approved, now expired" },
    { id: uid(), rule: "Continued stay PA (days 6+)", status: "missing" },
    { id: uid(), rule: "Medical necessity for extension", status: "missing" },
    { id: uid(), rule: "Complication documentation", status: "satisfied" },
  ],
  edgeCaseType: "Stale State",
  dataQuality: "complete",
  paDeadline: {
    type: "concurrent",
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    hoursRemaining: -48,
    isWeekend: false,
    payerSLA: "Concurrent review: Every 5 days",
    status: "overdue"
  },
  careLens: {
    overallConfidence: "Medium",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Low",
      clinicalClarity: "High",
    },
    denialRisk: "High",
    riskFactors: [
      {
        id: "rf-edge9-1",
        factor: "PA expired 2 days ago - care at risk",
        severity: "High",
        status: "open",
        explanation: "Initial 5-day authorization expired. Days 6-7 have no valid PA. Payer may deny these days.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "URGENT: Re-Authorization", description: "Submit continued stay request immediately" }
        ]
      },
      {
        id: "rf-edge9-2",
        factor: "Retroactive justification needed for gap days",
        severity: "High",
        status: "open",
        explanation: "Must document medical necessity for days 6-7 retroactively to recover payment.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Retroactive Justification", description: "Document why days 6-7 were medically necessary" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge9-1", gap: "Continued stay authorization not obtained (EXPIRED)", status: "open", policyReference: "Payer Contract: Concurrent Review Requirements" },
      { id: "pg-edge9-2", gap: "Medical necessity for days 6-7 not prospectively documented", status: "open", policyReference: "Retroactive PA Policy" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge9-1",
        text: "CRITICAL: Submit re-authorization request IMMEDIATELY",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Continued Stay PA", description: "Submit NOW" }]
      },
      {
        id: "rec-edge9-2",
        text: "Document medical necessity for expired days 6-7 retroactively",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Retroactive Justification", description: "Explain why extension was needed" }]
      },
      {
        id: "rec-edge9-3",
        text: "Set up calendar alert for future PA expirations",
        priority: "low",
        status: "pending",
        category: "administrative",
        suggestedActions: []
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 5 23:59", action: "PA EXPIRED - No renewal submitted", user: "AI System" },
      { id: uid(), timestamp: "Day 6 08:00", action: "ALERT: Care being delivered without valid PA", user: "CareLens" },
      { id: uid(), timestamp: "Day 7 08:00", action: "ESCALATION: 48 hours without PA - urgent action needed", user: "AI System" },
    ]
  }
}

// ============================================
// EDGE CASE 10: "Clean Slate" - Perfect Case
// Zero issues, ready to submit, shows ideal state
// ============================================
export const cleanSlatePatient: Patient = {
  id: "edge-10",
  name: "Grace Perfectcase",
  mrn: "MRN-100000",
  age: 45,
  gender: "F",
  dob: "12/1/1980",
  ssn: "***-**-1000",
  insurance: "Kaiser Permanente",
  admitted: "3 days ago",
  admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "415-A",
  urgency: "ROUTINE",
  tasks: 0,
  lengthOfStay: "3 days",
  chiefComplaint: "Elective laparoscopic cholecystectomy - uncomplicated",
  diagnoses: ["Symptomatic cholelithiasis", "Status post laparoscopic cholecystectomy"],
  medications: "Acetaminophen, Ondansetron PRN, DVT prophylaxis",
  clinicalCourse: "Elective cholecystectomy performed without complication. Post-op recovery uneventful. All documentation complete. Discharge planned for today. PA submitted and approved. This is an example of a perfectly documented case.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Surgery", description: "Laparoscopic cholecystectomy - uncomplicated" },
    { id: uid(), timestamp: "Day 2", title: "Post-Op Day 1", description: "Tolerating diet, ambulating, pain controlled" },
    { id: uid(), timestamp: "Day 3", title: "Discharge Day", description: "Ready for discharge, all criteria met" },
  ],
  alerts: [],
  documentsProcessed: 15,
  problemList: [
    { id: uid(), name: "Symptomatic cholelithiasis", icdCode: "K80.20", type: "primary", status: "resolved" },
  ],
  payerRules: [
    { id: uid(), rule: "Surgical indication documented", status: "satisfied", evidence: "Symptomatic gallstones on imaging" },
    { id: uid(), rule: "Procedure note complete", status: "satisfied", evidence: "Operative report" },
    { id: uid(), rule: "LOS within expected range", status: "satisfied", evidence: "3 days per DRG" },
    { id: uid(), rule: "Discharge criteria met", status: "satisfied", evidence: "All criteria documented" },
  ],
  edgeCaseType: "Clean Slate",
  dataQuality: "complete",
  careLens: {
    overallConfidence: "High",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "High",
      clinicalClarity: "High",
    },
    denialRisk: "Low",
    riskFactors: [],
    policyGaps: [],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge10-1",
        text: "Case fully documented - ready for PA submission",
        priority: "low",
        status: "completed",
        category: "administrative",
        suggestedActions: []
      },
      {
        id: "rec-edge10-2",
        text: "Discharge summary complete",
        priority: "low",
        status: "completed",
        category: "documentation",
        suggestedActions: []
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 1 14:00", action: "Pre-op documentation verified complete", user: "AI System" },
      { id: uid(), timestamp: "Day 1 18:00", action: "Operative report processed", user: "AI System" },
      { id: uid(), timestamp: "Day 2 09:00", action: "Post-op criteria on track", user: "CareLens" },
      { id: uid(), timestamp: "Day 3 08:00", action: "Case ready for PA - HIGH CONFIDENCE", user: "CareLens" },
      { id: uid(), timestamp: "Day 3 08:30", action: "PA submitted and approved", user: "Case Manager" },
    ]
  }
}

// ============================================
// EDGE CASE 11: "SDOH Blocking" - Social Barriers
// Medically ready but socially blocked discharge
// ============================================
export const sdohBlockingPatient: Patient = {
  id: "edge-11",
  name: "Maria Housingstuck",
  mrn: "MRN-111111",
  age: 68,
  gender: "F",
  dob: "6/20/1957",
  ssn: "***-**-1111",
  insurance: "Medicaid",
  admitted: "8 days ago",
  admissionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "280-A",
  urgency: "URGENT",
  tasks: 4,
  lengthOfStay: "8 days (medically ready day 4)",
  chiefComplaint: "Hip fracture s/p ORIF - medically ready for discharge but no safe disposition",
  diagnoses: ["Hip fracture - healed", "Status post ORIF", "Homeless", "No caregiver support"],
  medications: "Acetaminophen, Enoxaparin, Calcium/Vitamin D",
  clinicalCourse: "Patient s/p hip ORIF, medically stable since day 4. CANNOT be discharged due to homelessness, no caregiver, and SNF beds unavailable for Medicaid patients in the area. 4 extra hospital days with no medical necessity - payer will deny.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Surgery", description: "ORIF right hip fracture" },
    { id: uid(), timestamp: "Day 4", title: "Medically Ready", description: "PT cleared, wounds healing, medically stable" },
    { id: uid(), timestamp: "Day 5-8", title: "SDOH Barriers", description: "No SNF beds, no home, no caregiver - stuck" },
  ],
  alerts: [
    { id: uid(), message: "SDOH BARRIER: Patient is homeless - cannot discharge to street", type: "error" },
    { id: uid(), message: "SNF placement failed - no Medicaid beds available", type: "error" },
    { id: uid(), message: "4 days without medical necessity - denial expected", type: "warning" },
  ],
  documentsProcessed: 22,
  problemList: [
    { id: uid(), name: "Hip fracture, healed", icdCode: "S72.001D", type: "primary", status: "resolved" },
    { id: uid(), name: "Homelessness", icdCode: "Z59.00", type: "secondary", status: "active" },
    { id: uid(), name: "Lack of caregiver", icdCode: "Z74.2", type: "secondary", status: "active" },
  ],
  payerRules: [
    { id: uid(), rule: "Surgical care appropriate", status: "satisfied" },
    { id: uid(), rule: "Medical necessity for days 1-4", status: "satisfied" },
    { id: uid(), rule: "Medical necessity for days 5-8", status: "missing" },
    { id: uid(), rule: "Safe discharge disposition documented", status: "missing" },
  ],
  edgeCaseType: "SDOH Blocking",
  dataQuality: "complete",
  sdohFactors: [
    {
      id: "sdoh-1",
      category: "housing",
      description: "Patient is homeless - was living in shelter prior to admission",
      severity: "blocking",
      status: "unresolved",
      notes: "Shelter will not accept patient with mobility limitations"
    },
    {
      id: "sdoh-2",
      category: "caregiver",
      description: "No family or caregiver available",
      severity: "blocking",
      status: "unresolved",
      notes: "Patient has no emergency contacts, estranged from family"
    },
    {
      id: "sdoh-3",
      category: "transportation",
      description: "No transportation to follow-up appointments",
      severity: "barrier",
      status: "unresolved"
    }
  ],
  careLens: {
    overallConfidence: "Medium",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Low",
      clinicalClarity: "High",
    },
    denialRisk: "High",
    riskFactors: [
      {
        id: "rf-edge11-1",
        factor: "Medically ready but socially blocked - 4 days at risk",
        severity: "High",
        status: "open",
        explanation: "Patient has been medically ready since day 4. Days 5-8 have no medical necessity. Payer will likely deny.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Document SDOH Barriers", description: "Formally document social barriers preventing discharge" }
        ]
      },
      {
        id: "rf-edge11-2",
        factor: "No safe discharge disposition available",
        severity: "High",
        status: "open",
        explanation: "Homelessness and lack of SNF beds create unsafe discharge. Hospital has duty of care.",
        suggestedActions: [
          { id: uid(), type: "request_consult", label: "Escalate to Administration", description: "Hospital admin may need to intervene" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge11-1", gap: "Medical necessity for days 5-8 not documented (SDOH not covered)", status: "open", policyReference: "Payer does not cover social admissions" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge11-1",
        text: "Document SDOH barriers formally - may support appeal",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "SDOH Documentation", description: "Create formal SDOH barrier note" }]
      },
      {
        id: "rec-edge11-2",
        text: "Escalate to hospital administration for placement assistance",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Admin Escalation", description: "Request admin intervention" }]
      },
      {
        id: "rec-edge11-3",
        text: "Contact Medicaid ombudsman for SNF bed advocacy",
        priority: "medium",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Contact Ombudsman", description: "Request Medicaid advocacy" }]
      },
      {
        id: "rec-edge11-4",
        text: "Prepare for likely denial and appeal for days 5+",
        priority: "medium",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "review_case", label: "Prepare Appeal", description: "Gather documentation for appeal" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 4 10:00", action: "Patient medically ready for discharge", user: "AI System" },
      { id: uid(), timestamp: "Day 4 10:01", action: "SDOH barriers identified - discharge blocked", user: "CareLens" },
      { id: uid(), timestamp: "Day 6 09:00", action: "2 days without medical necessity - denial risk HIGH", user: "AI System" },
      { id: uid(), timestamp: "Day 8 09:00", action: "4 days without medical necessity - escalation recommended", user: "CareLens" },
    ]
  }
}

// ============================================
// EDGE CASE 12: "Concurrent Edit" - Multi-User
// Multiple providers editing same case
// ============================================
export const concurrentEditPatient: Patient = {
  id: "edge-12",
  name: "James Multiteam",
  mrn: "MRN-121212",
  age: 59,
  gender: "M",
  dob: "3/8/1966",
  ssn: "***-**-1212",
  insurance: "Anthem",
  admitted: "4 days ago",
  admissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "ICU-301",
  urgency: "STAT",
  tasks: 5,
  lengthOfStay: "4 days",
  chiefComplaint: "Multi-trauma from MVA - multiple services actively managing",
  diagnoses: ["Polytrauma", "Pulmonary contusion", "Rib fractures", "Splenic laceration (managed non-op)", "TBI - mild"],
  medications: "Multiple per trauma protocol",
  clinicalCourse: "Complex trauma patient with multiple teams actively managing. Surgery, Trauma, Pulmonology, Neurology, and Case Management all documenting simultaneously. Risk of conflicting updates and version conflicts.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Trauma Activation", description: "MVA, multiple injuries, ICU admission" },
    { id: uid(), timestamp: "Day 2", title: "Stabilized", description: "Non-operative management of spleen, chest tubes" },
    { id: uid(), timestamp: "Day 4", title: "Current", description: "5 teams actively managing, complex documentation" },
  ],
  alerts: [
    { id: uid(), message: "5 PROVIDERS CURRENTLY EDITING this case", type: "warning" },
    { id: uid(), message: "Potential documentation conflicts detected", type: "warning" },
    { id: uid(), message: "Coordinate updates to avoid version conflicts", type: "warning" },
  ],
  documentsProcessed: 67,
  problemList: [
    { id: uid(), name: "Polytrauma", icdCode: "T07", type: "primary", status: "active" },
    { id: uid(), name: "Pulmonary contusion", icdCode: "S27.329A", type: "secondary", status: "active" },
    { id: uid(), name: "Splenic laceration", icdCode: "S36.039A", type: "secondary", status: "active" },
    { id: uid(), name: "Mild TBI", icdCode: "S06.0X0A", type: "secondary", status: "active" },
  ],
  payerRules: [
    { id: uid(), rule: "Trauma admission criteria met", status: "satisfied" },
    { id: uid(), rule: "ICU level of care justified", status: "satisfied" },
    { id: uid(), rule: "All consults documented", status: "satisfied" },
    { id: uid(), rule: "Care plan coordinated", status: "unclear" },
  ],
  edgeCaseType: "Concurrent Edit",
  dataQuality: "complete",
  activeSessions: [
    {
      id: "session-1",
      user: "Dr. Thompson (Trauma Surgery)",
      role: "physician",
      startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      activeSection: "Surgical Plan"
    },
    {
      id: "session-2",
      user: "Dr. Patel (Pulmonology)",
      role: "physician",
      startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      activeSection: "Respiratory Status"
    },
    {
      id: "session-3",
      user: "RN Jackson",
      role: "nurse",
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      lastActivity: new Date().toISOString(),
      activeSection: "Nursing Assessment"
    },
    {
      id: "session-4",
      user: "Case Mgr Williams",
      role: "case_manager",
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      activeSection: "PA Documentation"
    },
    {
      id: "session-5",
      user: "Dr. Chen (Neurology)",
      role: "physician",
      startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      activeSection: "Neuro Status"
    }
  ],
  careLens: {
    overallConfidence: "Medium",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Medium",
      clinicalClarity: "Medium",
    },
    denialRisk: "Medium",
    riskFactors: [
      {
        id: "rf-edge12-1",
        factor: "5 concurrent users - documentation conflict risk",
        severity: "Medium",
        status: "open",
        explanation: "Multiple providers editing simultaneously may create conflicting or duplicate documentation.",
        suggestedActions: [
          { id: uid(), type: "review_case", label: "Coordinate Updates", description: "Communicate with team before major edits" }
        ]
      },
      {
        id: "rf-edge12-2",
        factor: "Care plan may have conflicting subspecialty inputs",
        severity: "Medium",
        status: "open",
        explanation: "5 different teams may have different priorities. Need unified plan for PA.",
        suggestedActions: [
          { id: uid(), type: "send_message", label: "Request Care Conference", description: "Coordinate multidisciplinary plan" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge12-1", gap: "Unified care plan across services not documented", status: "open", policyReference: "Payer requires coordinated treatment plan" },
    ],
    conflictingNotes: [
      "Surgery: 'Ready for floor transfer' vs Pulmonology: 'Needs continued ICU monitoring'",
      "Trauma: 'Continue NPO' vs Nutrition: 'Start enteral feeds'"
    ],
    recommendations: [
      {
        id: "rec-edge12-1",
        text: "Coordinate with all 5 teams before PA submission",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Team Coordination", description: "Message all providers" }]
      },
      {
        id: "rec-edge12-2",
        text: "Resolve floor vs ICU conflict before documentation",
        priority: "high",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "review_case", label: "Resolve ICU Decision", description: "Get consensus on level of care" }]
      },
      {
        id: "rec-edge12-3",
        text: "Consider brief care conference for unified plan",
        priority: "medium",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Schedule Huddle", description: "5-minute team huddle" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Today 08:00", action: "5 concurrent users detected on case", user: "AI System" },
      { id: uid(), timestamp: "Today 08:15", action: "Potential documentation conflict flagged", user: "CareLens" },
      { id: uid(), timestamp: "Today 08:30", action: "Surgery/Pulm ICU disagreement detected", user: "AI System" },
    ]
  }
}

// ============================================
// EDGE CASE 13: "24h Timer" - Urgent Deadline
// PA due in 24 hours with weekend approaching
// ============================================
export const urgentTimerPatient: Patient = {
  id: "edge-13",
  name: "Nancy Deadlinewatch",
  mrn: "MRN-131313",
  age: 72,
  gender: "F",
  dob: "10/12/1953",
  ssn: "***-**-1313",
  insurance: "Medicare Advantage",
  admitted: "2 days ago",
  admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "225-B",
  urgency: "STAT",
  tasks: 3,
  lengthOfStay: "2 days",
  chiefComplaint: "GI bleed requiring endoscopy - PA due tomorrow, Friday before weekend",
  diagnoses: ["Upper GI bleed", "Peptic ulcer", "Anemia from blood loss"],
  medications: "Pantoprazole drip, PRBCs x2, Octreotide",
  clinicalCourse: "Patient with upper GI bleed, stabilized after transfusion. Needs EGD for definitive management. PA required for procedure. Deadline is Friday 5pm - if missed, weekend delay means no procedure until Monday.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Admission", description: "GI bleed, Hgb 6.2, transfused" },
    { id: uid(), timestamp: "Day 2", title: "Stabilized", description: "Hgb stable at 9.0, EGD planned" },
  ],
  alerts: [
    { id: uid(), message: "PA DEADLINE: Friday 5pm - 22 hours remaining", type: "error" },
    { id: uid(), message: "WEEKEND RISK: If missed, procedure delayed until Monday", type: "warning" },
    { id: uid(), message: "Payer offices closed Sat-Sun", type: "warning" },
  ],
  documentsProcessed: 14,
  problemList: [
    { id: uid(), name: "Upper GI hemorrhage", icdCode: "K92.2", type: "primary", status: "active" },
    { id: uid(), name: "Peptic ulcer", icdCode: "K27.9", type: "secondary", status: "active" },
  ],
  payerRules: [
    { id: uid(), rule: "GI bleed documented", status: "satisfied" },
    { id: uid(), rule: "Transfusion requirements documented", status: "satisfied" },
    { id: uid(), rule: "EGD indication documented", status: "missing" },
    { id: uid(), rule: "PA submitted before deadline", status: "missing" },
  ],
  edgeCaseType: "24h Timer",
  dataQuality: "complete",
  paDeadline: {
    type: "initial",
    deadline: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    hoursRemaining: 22,
    isWeekend: true,
    payerSLA: "MA Plan: 24h response, no weekend processing",
    status: "at_risk"
  },
  careLens: {
    overallConfidence: "High",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Medium",
      clinicalClarity: "High",
    },
    denialRisk: "Medium",
    riskFactors: [
      {
        id: "rf-edge13-1",
        factor: "PA deadline in 22 hours - weekend approaching",
        severity: "High",
        status: "open",
        explanation: "If PA not submitted by Friday 5pm, payer offices closed until Monday. Procedure would be delayed 3 days.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "URGENT: Submit PA Now", description: "Complete EGD PA submission immediately" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge13-1", gap: "EGD procedure indication not formally documented", status: "open", policyReference: "MA Plan: Procedure PA requirements" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge13-1",
        text: "URGENT: Submit EGD PA before Friday 5pm deadline",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Submit PA NOW", description: "Immediate PA submission" }]
      },
      {
        id: "rec-edge13-2",
        text: "Document EGD indication clearly for PA",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "EGD Indication Note", description: "Document procedure necessity" }]
      },
      {
        id: "rec-edge13-3",
        text: "Notify GI of PA timeline - coordinate procedure scheduling",
        priority: "medium",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "send_message", label: "GI Notification", description: "Alert GI to PA timeline" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 2 08:00", action: "PA deadline identified: Friday 5pm", user: "AI System" },
      { id: uid(), timestamp: "Day 2 08:01", action: "WEEKEND ALERT: 22h until deadline, payer closed Sat-Sun", user: "CareLens" },
    ]
  }
}

// ============================================
// EDGE CASE 14: "Appeal Reopen" - Denial Received
// Previously denied, appeal workflow triggered
// ============================================
export const appealReopenPatient: Patient = {
  id: "edge-14",
  name: "Frank Deniedtwice",
  mrn: "MRN-141414",
  age: 64,
  gender: "M",
  dob: "1/30/1961",
  ssn: "***-**-1414",
  insurance: "Blue Cross Blue Shield",
  admitted: "6 days ago (discharged), readmitted today for appeal",
  admissionDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "N/A - Discharged",
  urgency: "URGENT",
  tasks: 4,
  lengthOfStay: "6 days (prior), appeal pending",
  chiefComplaint: "Cellulitis - PA denied for days 4-6, now appealing",
  diagnoses: ["Cellulitis of lower limb", "Type 2 DM", "Peripheral vascular disease"],
  medications: "Completed IV antibiotics, now on oral",
  clinicalCourse: "Patient was admitted for 6 days with cellulitis. PA approved days 1-3. Days 4-6 DENIED by payer (stated 'conversion to oral antibiotics possible'). Patient has been discharged but hospital is appealing the denial for $18,000 in denied charges.",
  timeline: [
    { id: uid(), timestamp: "Day 1-3", title: "Initial Stay (Approved)", description: "IV antibiotics, wound care - PA approved" },
    { id: uid(), timestamp: "Day 4-6", title: "Extended Stay (DENIED)", description: "Continued IV abx - payer denied" },
    { id: uid(), timestamp: "Today", title: "Appeal Filed", description: "Hospital appealing days 4-6 denial" },
  ],
  alerts: [
    { id: uid(), message: "PA DENIAL: Days 4-6 denied - $18,000 at risk", type: "error" },
    { id: uid(), message: "Appeal deadline: 30 days from denial", type: "warning" },
    { id: uid(), message: "Peer-to-peer review available", type: "warning" },
  ],
  documentsProcessed: 25,
  problemList: [
    { id: uid(), name: "Cellulitis of lower limb", icdCode: "L03.116", type: "primary", status: "resolved" },
    { id: uid(), name: "Type 2 DM with complications", icdCode: "E11.69", type: "comorbidity", status: "chronic" },
    { id: uid(), name: "Peripheral vascular disease", icdCode: "I73.9", type: "comorbidity", status: "chronic" },
  ],
  payerRules: [
    { id: uid(), rule: "Initial PA (days 1-3)", status: "satisfied", evidence: "Approved" },
    { id: uid(), rule: "Extended stay PA (days 4-6)", status: "missing", evidence: "DENIED" },
    { id: uid(), rule: "IV antibiotic medical necessity", status: "unclear", evidence: "Payer disputes" },
  ],
  edgeCaseType: "Appeal Reopen",
  dataQuality: "complete",
  paDeadline: {
    type: "appeal",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    hoursRemaining: 25 * 24,
    isWeekend: false,
    payerSLA: "Appeal must be filed within 30 days of denial",
    status: "on_track"
  },
  careLens: {
    overallConfidence: "Medium",
    confidenceBreakdown: {
      evidenceCompleteness: "High",
      policyAlignment: "Low",
      clinicalClarity: "High",
    },
    denialRisk: "High",
    riskFactors: [
      {
        id: "rf-edge14-1",
        factor: "PA DENIED for days 4-6 - $18,000 revenue at risk",
        severity: "High",
        status: "open",
        explanation: "Payer denied continued stay citing ability to convert to oral antibiotics. Hospital disagrees based on wound characteristics.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Prepare Appeal Letter", description: "Draft detailed clinical appeal" }
        ]
      },
      {
        id: "rf-edge14-2",
        factor: "Appeal requires additional clinical evidence",
        severity: "High",
        status: "open",
        explanation: "Original documentation may not have adequately justified IV antibiotics. Need stronger evidence for appeal.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Gather Evidence", description: "Collect wound photos, culture results, clinical notes" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge14-1", gap: "IV antibiotic justification insufficient per payer", status: "open", policyReference: "BCBS Medical Policy: IV Antibiotic Criteria" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge14-1",
        text: "Draft detailed appeal letter with clinical evidence",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Appeal Letter", description: "Create comprehensive appeal" }]
      },
      {
        id: "rec-edge14-2",
        text: "Request peer-to-peer review with payer medical director",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Request P2P", description: "Schedule peer-to-peer call" }]
      },
      {
        id: "rec-edge14-3",
        text: "Gather wound photos and culture results for appeal package",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "review_case", label: "Compile Evidence", description: "Gather supporting documentation" }]
      },
      {
        id: "rec-edge14-4",
        text: "Have ID physician provide supporting letter",
        priority: "medium",
        status: "pending",
        category: "consultation",
        suggestedActions: [{ id: uid(), type: "request_consult", label: "ID Support Letter", description: "Request specialist attestation" }]
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "6 days ago", action: "Initial PA submitted and approved (days 1-3)", user: "Case Manager" },
      { id: uid(), timestamp: "3 days ago", action: "Extended stay PA submitted (days 4-6)", user: "Case Manager" },
      { id: uid(), timestamp: "Yesterday", action: "PA DENIED for days 4-6", user: "BCBS" },
      { id: uid(), timestamp: "Today", action: "Appeal workflow initiated", user: "AI System" },
      { id: uid(), timestamp: "Today", action: "Evidence gaps identified for appeal", user: "CareLens" },
    ]
  }
}

// ============================================
// EDGE CASE 15: "Language Barrier" - Translation
// Non-English documentation requiring translation
// ============================================
export const languageBarrierPatient: Patient = {
  id: "edge-15",
  name: "Wei Chen",
  mrn: "MRN-151515",
  age: 76,
  gender: "M",
  dob: "8/3/1949",
  ssn: "***-**-1515",
  insurance: "Medicare Traditional",
  admitted: "2 days ago",
  admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  room: "330-A",
  urgency: "URGENT",
  tasks: 5,
  lengthOfStay: "2 days",
  chiefComplaint: "Stroke symptoms - patient speaks Mandarin only, family provided medical history in Chinese",
  diagnoses: ["Acute ischemic stroke", "Hypertension", "Atrial fibrillation"],
  medications: "tPA administered, Aspirin, Atorvastatin, Apixaban (pending)",
  clinicalCourse: "Patient presented with stroke symptoms. Limited English proficiency - required interpreter for all communication. Family provided prior medical records from China in Mandarin. Critical history and medication list in Chinese documents not yet translated.",
  timeline: [
    { id: uid(), timestamp: "Day 1", title: "Stroke Alert", description: "Acute stroke, tPA given, family contacted" },
    { id: uid(), timestamp: "Day 1", title: "Language Barrier", description: "Mandarin interpreter arranged, family provides Chinese records" },
    { id: uid(), timestamp: "Day 2", title: "Current", description: "Stable post-tPA, critical records still not translated" },
  ],
  alerts: [
    { id: uid(), message: "CRITICAL: Medical records in Mandarin - not translated", type: "error" },
    { id: uid(), message: "Medication history unknown - risk of interactions", type: "error" },
    { id: uid(), message: "Interpreter required for all patient communication", type: "warning" },
  ],
  documentsProcessed: 12,
  problemList: [
    { id: uid(), name: "Acute ischemic stroke", icdCode: "I63.9", type: "primary", status: "active" },
    { id: uid(), name: "Hypertension", icdCode: "I10", type: "comorbidity", status: "chronic" },
    { id: uid(), name: "Atrial fibrillation", icdCode: "I48.91", type: "comorbidity", status: "chronic" },
  ],
  payerRules: [
    { id: uid(), rule: "Stroke protocol followed", status: "satisfied", evidence: "tPA given within window" },
    { id: uid(), rule: "Complete medical history documented", status: "missing", evidence: "Chinese records not translated" },
    { id: uid(), rule: "Medication reconciliation complete", status: "missing" },
    { id: uid(), rule: "Interpreter use documented", status: "satisfied" },
  ],
  edgeCaseType: "Language Barrier",
  dataQuality: "sparse",
  sdohFactors: [
    {
      id: "sdoh-lang-1",
      category: "language",
      description: "Patient speaks Mandarin only - limited English proficiency",
      severity: "barrier",
      status: "in_progress",
      notes: "Interpreter services arranged, but delays in communication"
    },
    {
      id: "sdoh-lang-2",
      category: "literacy",
      description: "Medical records from China in Mandarin require professional translation",
      severity: "blocking",
      status: "unresolved",
      notes: "Translation service contacted, 24-48h turnaround"
    }
  ],
  careLens: {
    overallConfidence: "Low",
    confidenceBreakdown: {
      evidenceCompleteness: "Low",
      policyAlignment: "Medium",
      clinicalClarity: "Low",
    },
    denialRisk: "Medium",
    riskFactors: [
      {
        id: "rf-edge15-1",
        factor: "Medical records in Mandarin - critical history unknown",
        severity: "High",
        status: "open",
        explanation: "Patient's medical history and medication list from China have not been translated. Risk of drug interactions and incomplete PA documentation.",
        suggestedActions: [
          { id: uid(), type: "request_consult", label: "STAT Translation", description: "Request urgent professional translation" }
        ]
      },
      {
        id: "rf-edge15-2",
        factor: "Medication reconciliation incomplete",
        severity: "High",
        status: "open",
        explanation: "Cannot verify home medications without translated records. Anticoagulation decision pending.",
        suggestedActions: [
          { id: uid(), type: "add_documentation", label: "Document Unknown Meds", description: "Formally document medication uncertainty" }
        ]
      }
    ],
    policyGaps: [
      { id: "pg-edge15-1", gap: "Complete medical history not documented (translation pending)", status: "open", policyReference: "CMS requirements for complete history" },
      { id: "pg-edge15-2", gap: "Medication reconciliation incomplete", status: "open", policyReference: "Joint Commission medication reconciliation requirements" },
    ],
    conflictingNotes: [],
    recommendations: [
      {
        id: "rec-edge15-1",
        text: "URGENT: Obtain professional translation of Chinese medical records",
        priority: "high",
        status: "pending",
        category: "administrative",
        suggestedActions: [{ id: uid(), type: "request_consult", label: "Translation Service", description: "Contact medical translation service" }]
      },
      {
        id: "rec-edge15-2",
        text: "Document interpreter use for all patient interactions",
        priority: "high",
        status: "pending",
        category: "documentation",
        suggestedActions: [{ id: uid(), type: "add_documentation", label: "Interpreter Documentation", description: "Document interpreter ID and certification" }]
      },
      {
        id: "rec-edge15-3",
        text: "Contact family with interpreter to obtain verbal medication history",
        priority: "high",
        status: "pending",
        category: "clinical",
        suggestedActions: [{ id: uid(), type: "send_message", label: "Family Call", description: "Arrange interpreted call with family" }]
      },
      {
        id: "rec-edge15-4",
        text: "AI analysis limited by untranslated documents - flag for human review",
        priority: "medium",
        status: "pending",
        category: "clinical",
        suggestedActions: []
      }
    ],
    auditTrail: [
      { id: uid(), timestamp: "Day 1 08:00", action: "Stroke protocol initiated - tPA administered", user: "Dr. Neuro" },
      { id: uid(), timestamp: "Day 1 10:00", action: "Language barrier identified - Mandarin interpreter called", user: "RN" },
      { id: uid(), timestamp: "Day 1 14:00", action: "Chinese medical records received - TRANSLATION REQUIRED", user: "AI System" },
      { id: uid(), timestamp: "Day 2 08:00", action: "AI LIMITATION: Cannot process Mandarin documents", user: "CareLens" },
    ]
  }
}

// Export all edge case patients
export const edgeCasePatients: Patient[] = [
  dataDesertPatient,
  dataTsunamiPatient,
  insuranceLimboPatient,
  policyVoidPatient,
  conflictCentralPatient,
  statusFlipPatient,
  aiUncertaintyPatient,
  overrideRequiredPatient,
  staleStatePatient,
  cleanSlatePatient,
  sdohBlockingPatient,
  concurrentEditPatient,
  urgentTimerPatient,
  appealReopenPatient,
  languageBarrierPatient,
]
