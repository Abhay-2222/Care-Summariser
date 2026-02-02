import type { Patient, RiskFactor, PolicyGap, Recommendation, AuditEntry } from "./types"

// Helper to generate unique IDs
const uid = () => Math.random().toString(36).substring(2, 9)

// Name pools for realistic patient names
const firstNames = {
  M: ["James", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Andrew", "Paul", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy", "Ronald", "Edward", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary"],
  F: ["Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Dorothy", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia"]
}
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]

// Insurance pools
const insurances = ["Medicare Advantage", "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna", "Humana", "Kaiser Permanente", "Medicaid", "Medicare Traditional", "Anthem"]

// Room generator
const generateRoom = () => `${Math.floor(Math.random() * 500) + 100}-${"ABCD"[Math.floor(Math.random() * 4)]}`

// Date generator (within last 10 days)
const generateAdmissionDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// MRN generator
const generateMRN = () => `MRN-${Math.floor(Math.random() * 900000) + 100000}`

// ============================================
// ARCHETYPE 1: Surgery Infection Cases (10)
// ============================================
function generateSurgeryInfectionCase(index: number, state: "fresh" | "halfway" | "clean"): Patient {
  const gender = Math.random() > 0.5 ? "M" : "F"
  const age = Math.floor(Math.random() * 30) + 45
  const daysAgo = Math.floor(Math.random() * 5) + 2
  const surgeryTypes = ["CABG", "hip replacement", "knee arthroplasty", "spinal fusion", "abdominal surgery", "colectomy"]
  const surgery = surgeryTypes[index % surgeryTypes.length]
  
  const baseRisks: RiskFactor[] = [
    {
      id: `rf-si-${index}-1`,
      factor: "Extended LOS without step-down plan",
      severity: "High",
      mitigation: "Document transition to oral antibiotics criteria",
      status: state === "clean" ? "addressed" : "open",
      explanation: "Patient is on day " + (daysAgo + 1) + " with IV antibiotics but no documented plan for oral transition. Policy requires step-down criteria documentation by day 3 for surgical site infections.",
      evidenceLinks: ["Surgical Note", "Antibiotic Orders", "Culture Results"],
      suggestedActions: [
        { id: uid(), type: "create_plan", label: "Define Step-Down Plan", description: "Document oral antibiotic regimen and transition criteria" },
        { id: uid(), type: "add_documentation", label: "Add Transition Criteria", description: "Document clinical markers for oral transition readiness" },
      ]
    },
    {
      id: `rf-si-${index}-2`,
      factor: "Missing IV antibiotic justification note",
      severity: "High",
      mitigation: "Obtain infectious disease consult",
      status: state === "clean" ? "addressed" : state === "halfway" ? "addressed" : "open",
      explanation: "IV antibiotics require physician justification documenting why oral alternatives are not appropriate. This is a high-priority payer requirement.",
      evidenceLinks: ["Microbiology Report", "Wound Care Notes"],
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request ID Consult", description: "Submit infectious disease consult for antibiotic management" },
        { id: uid(), type: "add_documentation", label: "Draft IV Justification", description: "Create justification note for attending review" },
      ]
    },
    {
      id: `rf-si-${index}-3`,
      factor: "Wound culture sensitivities pending",
      severity: "Medium",
      mitigation: "Follow up on culture results",
      status: state === "clean" ? "addressed" : "open",
      explanation: "Targeted antibiotic therapy requires culture sensitivity results. Empiric therapy documentation needed until results available.",
      evidenceLinks: ["Culture Order", "Microbiology Pending"],
      suggestedActions: [
        { id: uid(), type: "order_test", label: "Check Culture Status", description: "Follow up on pending culture results" },
      ]
    },
    {
      id: `rf-si-${index}-4`,
      factor: "Readmission risk from social discharge barriers",
      severity: "Medium",
      mitigation: "Initiate care coordination consult",
      status: state === "fresh" ? "open" : "addressed",
      explanation: "Patient lives alone and may have difficulty with wound care and medication compliance at home.",
      evidenceLinks: ["Social Work Note", "Nursing Assessment"],
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request Social Work", description: "Evaluate discharge support needs" },
      ]
    }
  ]

  const baseGaps: PolicyGap[] = [
    {
      id: `pg-si-${index}-1`,
      gap: "IV antibiotic justification not documented by physician",
      status: state === "clean" ? "resolved" : state === "halfway" ? "in_progress" : "open",
      policyReference: "Payer Medical Policy: IV Antibiotic Medical Necessity Criteria",
      relatedNotes: ["Surgical Progress Notes", "Pharmacy Consult"],
    },
    {
      id: `pg-si-${index}-2`,
      gap: "No documented criteria for transition to oral therapy",
      status: state === "clean" ? "resolved" : "open",
      policyReference: "Hospital Antimicrobial Stewardship Protocol",
      relatedNotes: ["ID Recommendations", "Culture Sensitivities"],
    },
    {
      id: `pg-si-${index}-3`,
      gap: "Surgical site infection staging not documented",
      status: state === "fresh" ? "open" : "resolved",
      policyReference: "CDC SSI Classification Guidelines",
      relatedNotes: ["Wound Assessment", "Surgical Follow-up"],
    }
  ]

  const baseRecs: Recommendation[] = [
    {
      id: `rec-si-${index}-1`,
      text: "Request surgical attending note with IV antibiotic justification",
      priority: "high",
      status: state === "clean" ? "completed" : state === "halfway" ? "in_progress" : "pending",
      category: "documentation",
      suggestedActions: [
        { id: uid(), type: "send_message", label: "Message Surgical Attending", description: "Request note from surgical attending" },
        { id: uid(), type: "add_documentation", label: "Draft Justification Note", description: "Create draft justification for review" },
      ],
    },
    {
      id: `rec-si-${index}-2`,
      text: "Document specific clinical markers for oral antibiotic transition",
      priority: "high",
      status: state === "clean" ? "completed" : "pending",
      category: "clinical",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Add Transition Criteria", description: "Document oral antibiotic transition criteria" },
        { id: uid(), type: "order_test", label: "Order Follow-up Labs", description: "Order labs to monitor transition readiness" },
      ],
    },
    {
      id: `rec-si-${index}-3`,
      text: "Consider infectious disease consult for complex infection management",
      priority: "medium",
      status: state === "clean" ? "completed" : state === "halfway" ? "completed" : "pending",
      category: "consultation",
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request ID Consult", description: "Submit consult request to infectious disease" },
        { id: uid(), type: "review_case", label: "Review Infection Protocol", description: "View hospital infection management protocol" },
      ],
    },
    {
      id: `rec-si-${index}-4`,
      text: "Coordinate with social work for discharge planning",
      priority: "medium",
      status: state === "fresh" ? "pending" : "completed",
      category: "administrative",
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request SW Consult", description: "Initiate social work evaluation" },
      ],
    },
    {
      id: `rec-si-${index}-5`,
      text: "Update wound care documentation with measurements and staging",
      priority: "low",
      status: state === "fresh" ? "pending" : "completed",
      category: "documentation",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Update Wound Note", description: "Document current wound status" },
      ],
    }
  ]

  const auditTrail: AuditEntry[] = [
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 08:00", action: "Clinical Summary generated", user: "AI System" },
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 08:01", action: "High denial risk flagged - IV antibiotic documentation gap", user: "CareLens" },
    { id: uid(), timestamp: generateAdmissionDate(daysAgo - 1) + " 14:30", action: "ID consult ordered", user: "Dr. Williams" },
  ]

  if (state === "halfway" || state === "clean") {
    auditTrail.unshift({ id: uid(), timestamp: generateAdmissionDate(0) + " 10:15", action: "IV antibiotic justification documented", user: "Dr. Chen" })
  }
  if (state === "clean") {
    auditTrail.unshift({ id: uid(), timestamp: generateAdmissionDate(0) + " 11:00", action: "Case ready for PA submission", user: "CareLens" })
  }

  return {
    id: `si-${index}`,
    name: `${firstNames[gender][index % 30]} ${lastNames[index % 30]}`,
    mrn: generateMRN(),
    age,
    gender,
    dob: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${2026 - age}`,
    ssn: "***-**-" + Math.floor(Math.random() * 9000 + 1000),
    insurance: insurances[index % insurances.length],
    admitted: `${daysAgo} days ago`,
    admissionDate: generateAdmissionDate(daysAgo),
    room: generateRoom(),
    urgency: state === "fresh" ? "STAT" : state === "halfway" ? "URGENT" : "ROUTINE",
    tasks: state === "fresh" ? 4 : state === "halfway" ? 2 : 0,
    lengthOfStay: `${daysAgo} days`,
    chiefComplaint: `Post-operative day ${daysAgo - 1} ${surgery} with surgical site infection, fever, and wound erythema`,
    diagnoses: ["Surgical site infection", `Post-op ${surgery}`, "Fever", "Wound dehiscence"],
    medications: "Vancomycin 1g IV q12h, Piperacillin-tazobactam 3.375g IV q6h, Acetaminophen 650mg PO q6h PRN, DVT prophylaxis",
    clinicalCourse: `Patient is POD ${daysAgo - 1} following ${surgery}. Developed fever and wound erythema on POD 2. Wound cultures obtained, started on empiric IV antibiotics. WBC trending down. Wound care ongoing with daily dressing changes.`,
    timeline: [
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 06:00", title: "Fever Noted", description: "Temperature 38.9°C, wound erythema observed, cultures obtained" },
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 08:00", title: "IV Antibiotics Started", description: "Empiric broad-spectrum antibiotics initiated" },
      { id: uid(), timestamp: generateAdmissionDate(daysAgo - 1) + " 10:00", title: "ID Consult", description: "Infectious disease consulted for antibiotic management" },
    ],
    alerts: state === "clean" ? [] : [
      { id: uid(), message: "IV antibiotic justification documentation required", type: "warning" },
      { id: uid(), message: "Step-down criteria not yet documented", type: "warning" },
    ],
    documentsProcessed: Math.floor(Math.random() * 10) + 8,
    problemList: [
      { id: uid(), name: "Surgical Site Infection", icdCode: "T81.41XA", type: "primary", status: "active" },
      { id: uid(), name: `Status post ${surgery}`, icdCode: "Z96.89", type: "secondary", status: "active" },
      { id: uid(), name: "Fever", icdCode: "R50.9", type: "secondary", status: "active" },
    ],
    payerRules: [
      { id: uid(), rule: "IV antibiotic medical necessity documented", status: state === "clean" ? "satisfied" : "missing" },
      { id: uid(), rule: "Culture results documented", status: "satisfied", evidence: "Microbiology report" },
      { id: uid(), rule: "Step-down criteria defined", status: state === "clean" ? "satisfied" : "missing" },
      { id: uid(), rule: "Daily wound assessment documented", status: "satisfied", evidence: "Nursing notes" },
    ],
    careLens: {
      overallConfidence: state === "clean" ? "High" : state === "halfway" ? "Medium" : "Low",
      confidenceBreakdown: {
        evidenceCompleteness: state === "clean" ? "High" : "Medium",
        policyAlignment: state === "clean" ? "High" : "Low",
        clinicalClarity: "High",
      },
      denialRisk: state === "clean" ? "Low" : "High",
      riskFactors: state === "clean" ? baseRisks.slice(0, 1).map(r => ({ ...r, status: "addressed" as const })) : state === "halfway" ? baseRisks.slice(0, 2) : baseRisks,
      policyGaps: state === "clean" ? [] : state === "halfway" ? baseGaps.slice(0, 1) : baseGaps,
      conflictingNotes: state === "fresh" ? ["Surgical note mentions 'clean wound' vs nursing note documents 'purulent drainage'"] : [],
      recommendations: state === "clean" ? baseRecs.slice(0, 2).map(r => ({ ...r, status: "completed" as const })) : state === "halfway" ? baseRecs.slice(0, 3) : baseRecs,
      auditTrail,
    },
  }
}

// ============================================
// ARCHETYPE 2: CHF Exacerbation Cases (10)
// ============================================
function generateCHFCase(index: number, state: "fresh" | "halfway" | "clean"): Patient {
  const gender = Math.random() > 0.5 ? "M" : "F"
  const age = Math.floor(Math.random() * 25) + 55
  const daysAgo = Math.floor(Math.random() * 4) + 1

  const baseRisks: RiskFactor[] = [
    {
      id: `rf-chf-${index}-1`,
      factor: "Missing cardiology consultation note",
      severity: "High",
      mitigation: "Request consult note from cardiology",
      status: state === "clean" ? "addressed" : "open",
      explanation: "Payer policy requires cardiology consultation documentation within 24 hours for heart failure admissions. Denial probability: 73%.",
      evidenceLinks: ["ED Admission Note", "Cardiology Order - Pending"],
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request Cardiology Note", description: "Send urgent request to cardiology" },
        { id: uid(), type: "add_documentation", label: "Draft Interim Note", description: "Create interim documentation" },
      ]
    },
    {
      id: `rf-chf-${index}-2`,
      factor: "Diuretic resistance - IV to PO switch timing unclear",
      severity: "Medium",
      mitigation: "Document diuretic response and transition criteria",
      status: state === "fresh" ? "open" : "addressed",
      explanation: "Patient has required IV diuretics for " + daysAgo + " days. Documentation of transition criteria to oral therapy needed.",
      evidenceLinks: ["Daily I/O", "BMP Results", "Weight Trend"],
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Document Diuretic Response", description: "Record fluid balance and diuretic efficacy" },
      ]
    },
    {
      id: `rf-chf-${index}-3`,
      factor: "Echo results - device eligibility assessment needed",
      severity: "Medium",
      mitigation: "Document EF and device candidacy",
      status: state === "clean" ? "addressed" : state === "halfway" ? "addressed" : "open",
      explanation: "If EF ≤35%, patient may qualify for ICD/CRT. This needs to be documented for comprehensive care planning.",
      evidenceLinks: ["Echocardiogram", "Cardiology Notes"],
      suggestedActions: [
        { id: uid(), type: "review_case", label: "Review Echo Results", description: "Assess device eligibility criteria" },
      ]
    },
    {
      id: `rf-chf-${index}-4`,
      factor: "Home health SDOH assessment incomplete",
      severity: "Low",
      mitigation: "Complete social determinants screening",
      status: state === "fresh" ? "open" : "addressed",
      explanation: "Patient's ability to manage complex medication regimen at home needs assessment.",
      evidenceLinks: ["Social Work Note"],
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request SW Evaluation", description: "Assess home support needs" },
      ]
    }
  ]

  const baseGaps: PolicyGap[] = [
    {
      id: `pg-chf-${index}-1`,
      gap: "Cardiology consultation not documented within required 24-hour window",
      status: state === "clean" ? "resolved" : "open",
      policyReference: "Medicare LCD L35000: Heart Failure Inpatient Criteria",
      relatedNotes: ["ED Note", "Admission Orders"],
    },
    {
      id: `pg-chf-${index}-2`,
      gap: "Discharge criteria checklist incomplete",
      status: state === "clean" ? "resolved" : state === "halfway" ? "in_progress" : "open",
      policyReference: "Hospital Policy: Discharge Planning Requirements",
      relatedNotes: ["Nursing Assessment", "Care Coordination Notes"],
    }
  ]

  const baseRecs: Recommendation[] = [
    {
      id: `rec-chf-${index}-1`,
      text: "Obtain cardiology consult note before PA submission",
      priority: "high",
      status: state === "clean" ? "completed" : "pending",
      category: "consultation",
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request Cardiology Consult", description: "Send consult request" },
        { id: uid(), type: "send_message", label: "Message Cardiologist", description: "Direct message to on-call cardiologist" },
      ],
    },
    {
      id: `rec-chf-${index}-2`,
      text: "Document specific discharge criteria being monitored",
      priority: "medium",
      status: state === "clean" ? "completed" : state === "halfway" ? "in_progress" : "pending",
      category: "documentation",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Add Discharge Criteria Note", description: "Open documentation template" },
      ],
    },
    {
      id: `rec-chf-${index}-3`,
      text: "Add medication reconciliation to support continued stay",
      priority: "medium",
      status: state === "fresh" ? "pending" : "completed",
      category: "documentation",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Complete Med Rec Form", description: "Open medication reconciliation form" },
      ],
    }
  ]

  const auditTrail: AuditEntry[] = [
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 14:30", action: "Clinical Summary generated", user: "AI System" },
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 14:31", action: "Medium denial risk flagged", user: "CareLens" },
  ]

  if (state !== "fresh") {
    auditTrail.unshift({ id: uid(), timestamp: generateAdmissionDate(0) + " 09:00", action: "Cardiology consult documented", user: "Dr. Patel" })
  }

  return {
    id: `chf-${index}`,
    name: `${firstNames[gender][(index + 10) % 30]} ${lastNames[(index + 5) % 30]}`,
    mrn: generateMRN(),
    age,
    gender,
    dob: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${2026 - age}`,
    ssn: "***-**-" + Math.floor(Math.random() * 9000 + 1000),
    insurance: insurances[(index + 3) % insurances.length],
    admitted: `${daysAgo} days ago`,
    admissionDate: generateAdmissionDate(daysAgo),
    room: generateRoom(),
    urgency: state === "fresh" ? "STAT" : state === "halfway" ? "URGENT" : "ROUTINE",
    tasks: state === "fresh" ? 3 : state === "halfway" ? 1 : 0,
    lengthOfStay: `${daysAgo} days`,
    chiefComplaint: "Acute onset shortness of breath and lower extremity edema, worsening over 48 hours",
    diagnoses: ["Acute decompensated heart failure", "Volume overload", "Pulmonary edema"],
    medications: "Furosemide 40mg IV BID, Carvedilol 12.5mg PO BID, Lisinopril 10mg PO daily, Spironolactone 25mg PO daily",
    clinicalCourse: `Patient admitted with acute decompensated heart failure. BNP elevated at ${1000 + Math.floor(Math.random() * 500)}. Started on IV diuretics with ${state === "clean" ? "excellent" : "good"} response. Fluid balance negative ${1 + Math.random().toFixed(1)}L.`,
    timeline: [
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 14:30", title: "ED Admission", description: "Acute SOB, O2 88% RA, bilateral crackles" },
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 16:00", title: "Chest X-ray", description: "Bilateral pulmonary edema, cardiomegaly" },
      { id: uid(), timestamp: generateAdmissionDate(daysAgo - 1) + " 08:00", title: "Diuretic Response", description: "Good urine output, improved O2 requirements" },
    ],
    alerts: state === "clean" ? [] : [
      { id: uid(), message: "Missing cardiology consultation for medical necessity", type: "warning" },
    ],
    documentsProcessed: Math.floor(Math.random() * 8) + 10,
    problemList: [
      { id: uid(), name: "Acute Decompensated Heart Failure", icdCode: "I50.31", type: "primary", status: "active" },
      { id: uid(), name: "Pulmonary Edema", icdCode: "J81.0", type: "secondary", status: "active" },
      { id: uid(), name: "Hypertension", icdCode: "I10", type: "comorbidity", status: "chronic" },
    ],
    payerRules: [
      { id: uid(), rule: "Medical necessity for inpatient admission", status: "satisfied", evidence: "ED notes, vital signs" },
      { id: uid(), rule: "Cardiology consultation within 24 hours", status: state === "clean" ? "satisfied" : "missing" },
      { id: uid(), rule: "BNP/Troponin documented", status: "satisfied", evidence: "Lab results" },
    ],
    careLens: {
      overallConfidence: state === "clean" ? "High" : "Medium",
      confidenceBreakdown: {
        evidenceCompleteness: "High",
        policyAlignment: state === "clean" ? "High" : "Medium",
        clinicalClarity: "High",
      },
      denialRisk: state === "clean" ? "Low" : "Medium",
      riskFactors: state === "clean" ? [] : state === "halfway" ? baseRisks.slice(0, 2) : baseRisks,
      policyGaps: state === "clean" ? [] : baseGaps,
      conflictingNotes: [],
      recommendations: baseRecs.map(r => state === "clean" ? { ...r, status: "completed" as const } : r),
      auditTrail,
    },
  }
}

// ============================================
// ARCHETYPE 3: COPD/AECOPD Cases (10)
// ============================================
function generateCOPDCase(index: number, state: "fresh" | "halfway" | "clean"): Patient {
  const gender = Math.random() > 0.6 ? "M" : "F"
  const age = Math.floor(Math.random() * 20) + 55
  const daysAgo = Math.floor(Math.random() * 4) + 1

  const baseRisks: RiskFactor[] = [
    {
      id: `rf-copd-${index}-1`,
      factor: "Steroid taper plan undocumented",
      severity: "High",
      mitigation: "Document steroid duration and taper schedule",
      status: state === "clean" ? "addressed" : "open",
      explanation: "Patient on systemic steroids without documented taper plan. Payer requires steroid duration justification for continued stay.",
      evidenceLinks: ["Medication Orders", "Progress Notes"],
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Add Steroid Taper Plan", description: "Document steroid schedule and taper" },
      ]
    },
    {
      id: `rf-copd-${index}-2`,
      factor: "NIV weaning criteria unclear",
      severity: "Medium",
      mitigation: "Document BiPAP/CPAP weaning parameters",
      status: state === "fresh" ? "open" : "addressed",
      explanation: "Patient on non-invasive ventilation without clear weaning criteria documented.",
      evidenceLinks: ["Respiratory Notes", "ABG Results"],
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Document NIV Criteria", description: "Add weaning parameters" },
      ]
    },
    {
      id: `rf-copd-${index}-3`,
      factor: "Smoking cessation counseling not documented",
      severity: "Low",
      mitigation: "Document tobacco cessation discussion",
      status: state === "fresh" ? "open" : "addressed",
      explanation: "Quality measure requires smoking cessation counseling documentation.",
      evidenceLinks: ["Nursing Notes"],
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Document Counseling", description: "Record smoking cessation discussion" },
      ]
    }
  ]

  const baseGaps: PolicyGap[] = [
    {
      id: `pg-copd-${index}-1`,
      gap: "Systemic steroid duration not justified",
      status: state === "clean" ? "resolved" : "open",
      policyReference: "GOLD Guidelines: COPD Exacerbation Management",
      relatedNotes: ["Medication Orders", "Pulmonology Notes"],
    }
  ]

  const baseRecs: Recommendation[] = [
    {
      id: `rec-copd-${index}-1`,
      text: "Document steroid taper plan and duration justification",
      priority: "high",
      status: state === "clean" ? "completed" : "pending",
      category: "documentation",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Add Steroid Plan", description: "Document taper schedule" },
      ],
    },
    {
      id: `rec-copd-${index}-2`,
      text: "Add NIV weaning criteria to respiratory notes",
      priority: "medium",
      status: state === "fresh" ? "pending" : "completed",
      category: "clinical",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Document Weaning Criteria", description: "Add BiPAP parameters" },
      ],
    },
    {
      id: `rec-copd-${index}-3`,
      text: "Document smoking cessation counseling",
      priority: "low",
      status: state === "fresh" ? "pending" : "completed",
      category: "documentation",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Add Counseling Note", description: "Document tobacco discussion" },
      ],
    }
  ]

  const auditTrail: AuditEntry[] = [
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 10:00", action: "Clinical Summary generated", user: "AI System" },
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 10:01", action: "Steroid documentation gap identified", user: "CareLens" },
  ]

  return {
    id: `copd-${index}`,
    name: `${firstNames[gender][(index + 15) % 30]} ${lastNames[(index + 10) % 30]}`,
    mrn: generateMRN(),
    age,
    gender,
    dob: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${2026 - age}`,
    ssn: "***-**-" + Math.floor(Math.random() * 9000 + 1000),
    insurance: insurances[(index + 5) % insurances.length],
    admitted: `${daysAgo} days ago`,
    admissionDate: generateAdmissionDate(daysAgo),
    room: generateRoom(),
    urgency: state === "fresh" ? "URGENT" : "ROUTINE",
    tasks: state === "fresh" ? 3 : state === "halfway" ? 1 : 0,
    lengthOfStay: `${daysAgo} days`,
    chiefComplaint: "Acute exacerbation of COPD with increased dyspnea, productive cough, and wheezing",
    diagnoses: ["Acute exacerbation of COPD", "Respiratory failure", "Hypoxemia"],
    medications: "Prednisone 40mg PO daily, Albuterol/Ipratropium nebs q4h, Azithromycin 500mg PO daily, O2 supplementation",
    clinicalCourse: `Patient admitted with AECOPD. Required BiPAP initially, now weaning to nasal cannula. Responding well to steroids and bronchodilators.`,
    timeline: [
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 02:00", title: "ED Arrival", description: "Severe dyspnea, O2 sat 82% RA, started on BiPAP" },
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 06:00", title: "ABG Results", description: "pH 7.32, pCO2 58, showing improvement" },
    ],
    alerts: state === "clean" ? [] : [
      { id: uid(), message: "Steroid taper plan documentation required", type: "warning" },
    ],
    documentsProcessed: Math.floor(Math.random() * 6) + 8,
    problemList: [
      { id: uid(), name: "Acute Exacerbation of COPD", icdCode: "J44.1", type: "primary", status: "active" },
      { id: uid(), name: "Acute Respiratory Failure", icdCode: "J96.00", type: "secondary", status: "active" },
    ],
    payerRules: [
      { id: uid(), rule: "Oxygen requirements documented", status: "satisfied", evidence: "Respiratory notes" },
      { id: uid(), rule: "Steroid justification documented", status: state === "clean" ? "satisfied" : "missing" },
    ],
    careLens: {
      overallConfidence: state === "clean" ? "High" : "Medium",
      confidenceBreakdown: {
        evidenceCompleteness: state === "clean" ? "High" : "Medium",
        policyAlignment: state === "clean" ? "High" : "Medium",
        clinicalClarity: "High",
      },
      denialRisk: state === "clean" ? "Low" : "Medium",
      riskFactors: state === "clean" ? [] : state === "halfway" ? baseRisks.slice(0, 1) : baseRisks,
      policyGaps: state === "clean" ? [] : baseGaps,
      conflictingNotes: [],
      recommendations: baseRecs.map(r => state === "clean" ? { ...r, status: "completed" as const } : r),
      auditTrail,
    },
  }
}

// ============================================
// ARCHETYPE 4: Psych Admission Cases (10)
// ============================================
function generatePsychCase(index: number, state: "fresh" | "halfway" | "clean"): Patient {
  const gender = Math.random() > 0.5 ? "M" : "F"
  const age = Math.floor(Math.random() * 40) + 20
  const daysAgo = Math.floor(Math.random() * 5) + 2
  const diagnoses = ["Major depressive disorder with suicidal ideation", "Bipolar disorder - manic episode", "Schizophrenia - acute exacerbation", "Anxiety disorder with panic attacks"]
  const diagnosis = diagnoses[index % diagnoses.length]

  const baseRisks: RiskFactor[] = [
    {
      id: `rf-psych-${index}-1`,
      factor: "Safety planning documentation incomplete",
      severity: "High",
      mitigation: "Complete safety plan with patient",
      status: state === "clean" ? "addressed" : "open",
      explanation: "Payer requires documented safety plan for psychiatric admissions with suicidal ideation.",
      evidenceLinks: ["Psychiatry Notes", "Nursing Assessment"],
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Complete Safety Plan", description: "Document safety planning session" },
      ]
    },
    {
      id: `rf-psych-${index}-2`,
      factor: "Medication reconciliation gaps - interaction risks",
      severity: "High",
      mitigation: "Complete psychiatric medication reconciliation",
      status: state === "fresh" ? "open" : "addressed",
      explanation: "Multiple psychotropic medications without complete home medication verification.",
      evidenceLinks: ["Pharmacy Notes", "Admission Orders"],
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Complete Med Rec", description: "Verify home psychiatric medications" },
      ]
    },
    {
      id: `rf-psych-${index}-3`,
      factor: "Capacity evaluation pending",
      severity: "Medium",
      mitigation: "Document capacity assessment",
      status: state === "clean" ? "addressed" : state === "halfway" ? "addressed" : "open",
      explanation: "Decision-making capacity assessment needed for treatment consent.",
      evidenceLinks: ["Psychiatry Consult"],
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request Capacity Eval", description: "Initiate formal capacity assessment" },
      ]
    }
  ]

  const baseGaps: PolicyGap[] = [
    {
      id: `pg-psych-${index}-1`,
      gap: "Safety plan not documented per payer requirements",
      status: state === "clean" ? "resolved" : "open",
      policyReference: "Behavioral Health Inpatient Criteria - Safety Documentation",
      relatedNotes: ["Psychiatry Assessment", "Nursing Safety Check"],
    },
    {
      id: `pg-psych-${index}-2`,
      gap: "Discharge readiness criteria not defined",
      status: state === "clean" ? "resolved" : state === "halfway" ? "in_progress" : "open",
      policyReference: "Psychiatric Discharge Planning Protocol",
      relatedNotes: ["Treatment Plan", "Social Work Notes"],
    }
  ]

  const baseRecs: Recommendation[] = [
    {
      id: `rec-psych-${index}-1`,
      text: "Complete and document safety planning session",
      priority: "high",
      status: state === "clean" ? "completed" : "pending",
      category: "clinical",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Document Safety Plan", description: "Complete safety plan template" },
      ],
    },
    {
      id: `rec-psych-${index}-2`,
      text: "Verify and reconcile psychiatric medications",
      priority: "high",
      status: state === "fresh" ? "pending" : "completed",
      category: "documentation",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Complete Med Rec", description: "Reconcile psychiatric medications" },
      ],
    },
    {
      id: `rec-psych-${index}-3`,
      text: "Coordinate with outpatient psychiatry for follow-up",
      priority: "medium",
      status: state === "clean" ? "completed" : "pending",
      category: "administrative",
      suggestedActions: [
        { id: uid(), type: "schedule_followup", label: "Schedule Follow-up", description: "Arrange outpatient appointment" },
      ],
    }
  ]

  const auditTrail: AuditEntry[] = [
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 20:00", action: "Clinical Summary generated", user: "AI System" },
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 20:01", action: "Safety documentation gap flagged", user: "CareLens" },
  ]

  return {
    id: `psych-${index}`,
    name: `${firstNames[gender][(index + 20) % 30]} ${lastNames[(index + 15) % 30]}`,
    mrn: generateMRN(),
    age,
    gender,
    dob: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${2026 - age}`,
    ssn: "***-**-" + Math.floor(Math.random() * 9000 + 1000),
    insurance: insurances[(index + 7) % insurances.length],
    admitted: `${daysAgo} days ago`,
    admissionDate: generateAdmissionDate(daysAgo),
    room: `BH-${Math.floor(Math.random() * 20) + 101}`,
    urgency: state === "fresh" ? "STAT" : "URGENT",
    tasks: state === "fresh" ? 4 : state === "halfway" ? 2 : 0,
    lengthOfStay: `${daysAgo} days`,
    chiefComplaint: diagnosis.includes("suicidal") ? "Suicidal ideation with plan, brought by family" : `${diagnosis} - acute symptoms requiring stabilization`,
    diagnoses: [diagnosis, "Insomnia", "Anxiety"],
    medications: "Sertraline 100mg PO daily, Quetiapine 200mg PO qhs, Lorazepam 1mg PO BID PRN anxiety",
    clinicalCourse: `Patient admitted for psychiatric stabilization. ${state === "clean" ? "Symptoms improving with medication adjustment. Participating in group therapy." : "Currently being stabilized on medications."}`,
    timeline: [
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 18:00", title: "ED Evaluation", description: "Psychiatric emergency evaluation completed" },
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 22:00", title: "Admission to BH Unit", description: "Transferred to behavioral health unit on 1:1 observation" },
    ],
    alerts: state === "clean" ? [] : [
      { id: uid(), message: "Safety plan documentation required", type: "error" },
      { id: uid(), message: "Psychiatric medication reconciliation incomplete", type: "warning" },
    ],
    documentsProcessed: Math.floor(Math.random() * 5) + 6,
    problemList: [
      { id: uid(), name: diagnosis, icdCode: "F32.9", type: "primary", status: "active" },
      { id: uid(), name: "Insomnia", icdCode: "G47.00", type: "secondary", status: "active" },
    ],
    payerRules: [
      { id: uid(), rule: "Safety assessment documented", status: state === "clean" ? "satisfied" : "missing" },
      { id: uid(), rule: "Treatment plan with goals documented", status: state === "clean" ? "satisfied" : "unclear" },
    ],
    careLens: {
      overallConfidence: state === "clean" ? "High" : "Low",
      confidenceBreakdown: {
        evidenceCompleteness: state === "clean" ? "High" : "Low",
        policyAlignment: state === "clean" ? "High" : "Low",
        clinicalClarity: "Medium",
      },
      denialRisk: state === "clean" ? "Low" : "High",
      riskFactors: state === "clean" ? [] : state === "halfway" ? baseRisks.slice(0, 1) : baseRisks,
      policyGaps: state === "clean" ? [] : baseGaps,
      conflictingNotes: state === "fresh" ? ["ED note: 'patient denies SI' vs Psychiatry: 'endorses active suicidal ideation'"] : [],
      recommendations: baseRecs.map(r => state === "clean" ? { ...r, status: "completed" as const } : r),
      auditTrail,
    },
  }
}

// ============================================
// ARCHETYPE 5: OB Complication Cases (10)
// ============================================
function generateOBCase(index: number, state: "fresh" | "halfway" | "clean"): Patient {
  const age = Math.floor(Math.random() * 15) + 22
  const daysAgo = Math.floor(Math.random() * 3) + 1
  const complications = ["Preterm labor at 32 weeks", "Preeclampsia with severe features", "Placenta previa with bleeding", "Gestational diabetes - uncontrolled"]
  const complication = complications[index % complications.length]

  const baseRisks: RiskFactor[] = [
    {
      id: `rf-ob-${index}-1`,
      factor: "Tocolysis justification documentation needed",
      severity: "High",
      mitigation: "Document tocolytic therapy rationale",
      status: state === "clean" ? "addressed" : "open",
      explanation: "Tocolytic therapy requires documentation of gestational age, contraindications considered, and treatment goals.",
      evidenceLinks: ["OB Notes", "L&D Assessment", "Ultrasound Report"],
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Document Tocolysis Plan", description: "Add tocolytic justification" },
      ]
    },
    {
      id: `rf-ob-${index}-2`,
      factor: "Magnesium neuroprotection - renal monitoring gaps",
      severity: "Medium",
      mitigation: "Document magnesium levels and renal function",
      status: state === "fresh" ? "open" : "addressed",
      explanation: "Magnesium sulfate therapy requires regular monitoring documentation.",
      evidenceLinks: ["Lab Results", "Medication Administration"],
      suggestedActions: [
        { id: uid(), type: "order_test", label: "Order Mag Level", description: "Check magnesium level and renal function" },
      ]
    },
    {
      id: `rf-ob-${index}-3`,
      factor: "NICU transfer criteria not documented",
      severity: "Medium",
      mitigation: "Document NICU notification and criteria",
      status: state === "clean" ? "addressed" : state === "halfway" ? "addressed" : "open",
      explanation: "High-risk delivery requires documented NICU coordination.",
      evidenceLinks: ["Neonatology Consult", "Delivery Plan"],
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request NICU Consult", description: "Notify neonatology team" },
      ]
    }
  ]

  const baseGaps: PolicyGap[] = [
    {
      id: `pg-ob-${index}-1`,
      gap: "Antenatal corticosteroid administration timing not documented",
      status: state === "clean" ? "resolved" : "open",
      policyReference: "ACOG Practice Bulletin: Antenatal Corticosteroids",
      relatedNotes: ["Medication Orders", "OB Progress Note"],
    }
  ]

  const baseRecs: Recommendation[] = [
    {
      id: `rec-ob-${index}-1`,
      text: "Document tocolytic therapy justification and duration",
      priority: "high",
      status: state === "clean" ? "completed" : "pending",
      category: "documentation",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Add Tocolysis Note", description: "Document therapy rationale" },
      ],
    },
    {
      id: `rec-ob-${index}-2`,
      text: "Ensure betamethasone timing documented per protocol",
      priority: "high",
      status: state === "fresh" ? "pending" : "completed",
      category: "clinical",
      suggestedActions: [
        { id: uid(), type: "add_documentation", label: "Document Steroid Timing", description: "Record corticosteroid administration" },
      ],
    },
    {
      id: `rec-ob-${index}-3`,
      text: "Coordinate with neonatology for delivery planning",
      priority: "medium",
      status: state === "clean" ? "completed" : "pending",
      category: "consultation",
      suggestedActions: [
        { id: uid(), type: "request_consult", label: "Request NICU Consult", description: "Coordinate delivery plan" },
      ],
    }
  ]

  const auditTrail: AuditEntry[] = [
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 03:00", action: "Clinical Summary generated", user: "AI System" },
    { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 03:01", action: "High-risk pregnancy protocol initiated", user: "CareLens" },
  ]

  return {
    id: `ob-${index}`,
    name: `${firstNames.F[(index + 5) % 30]} ${lastNames[(index + 20) % 30]}`,
    mrn: generateMRN(),
    age,
    gender: "F",
    dob: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${2026 - age}`,
    ssn: "***-**-" + Math.floor(Math.random() * 9000 + 1000),
    insurance: insurances[(index + 2) % insurances.length],
    admitted: `${daysAgo} days ago`,
    admissionDate: generateAdmissionDate(daysAgo),
    room: `L&D-${Math.floor(Math.random() * 10) + 1}`,
    urgency: state === "fresh" ? "STAT" : "URGENT",
    tasks: state === "fresh" ? 3 : state === "halfway" ? 1 : 0,
    lengthOfStay: `${daysAgo} days`,
    chiefComplaint: complication,
    diagnoses: [complication, "Pregnancy at 32 weeks", "Threatened preterm delivery"],
    medications: "Magnesium sulfate 2g/hr IV, Betamethasone 12mg IM x2 doses, Nifedipine 20mg PO q6h",
    clinicalCourse: `Patient admitted for ${complication}. ${state === "clean" ? "Contractions have stopped with tocolysis. Fetal status reassuring." : "Currently receiving magnesium for neuroprotection and tocolysis."}`,
    timeline: [
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 02:00", title: "L&D Admission", description: "Contractions q5 min, cervix 2cm dilated" },
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 02:30", title: "Tocolysis Initiated", description: "Magnesium sulfate and nifedipine started" },
      { id: uid(), timestamp: generateAdmissionDate(daysAgo) + " 03:00", title: "Betamethasone #1", description: "First dose of antenatal corticosteroids given" },
    ],
    alerts: state === "clean" ? [] : [
      { id: uid(), message: "Tocolysis justification documentation required", type: "warning" },
    ],
    documentsProcessed: Math.floor(Math.random() * 5) + 8,
    problemList: [
      { id: uid(), name: complication, icdCode: "O60.00", type: "primary", status: "active" },
      { id: uid(), name: "Pregnancy at 32 weeks", icdCode: "Z3A.32", type: "secondary", status: "active" },
    ],
    payerRules: [
      { id: uid(), rule: "Tocolytic therapy indication documented", status: state === "clean" ? "satisfied" : "missing" },
      { id: uid(), rule: "Antenatal corticosteroids administered", status: "satisfied", evidence: "MAR documentation" },
      { id: uid(), rule: "High-risk OB criteria met", status: "satisfied", evidence: "Admission assessment" },
    ],
    careLens: {
      overallConfidence: state === "clean" ? "High" : "Medium",
      confidenceBreakdown: {
        evidenceCompleteness: state === "clean" ? "High" : "Medium",
        policyAlignment: state === "clean" ? "High" : "Medium",
        clinicalClarity: "High",
      },
      denialRisk: state === "clean" ? "Low" : "Medium",
      riskFactors: state === "clean" ? [] : state === "halfway" ? baseRisks.slice(0, 1) : baseRisks,
      policyGaps: state === "clean" ? [] : baseGaps,
      conflictingNotes: [],
      recommendations: baseRecs.map(r => state === "clean" ? { ...r, status: "completed" as const } : r),
      auditTrail,
    },
  }
}

// ============================================
// Generate All Patients
// ============================================
export function generateAllPatients(): Patient[] {
  const patients: Patient[] = []
  const states: ("fresh" | "halfway" | "clean")[] = ["fresh", "halfway", "clean"]
  
  // Generate 10 cases per archetype, rotating through states
  for (let i = 1; i <= 10; i++) {
    const state = states[(i - 1) % 3]
    patients.push(generateSurgeryInfectionCase(i, state))
  }
  
  for (let i = 1; i <= 10; i++) {
    const state = states[(i - 1) % 3]
    patients.push(generateCHFCase(i, state))
  }
  
  for (let i = 1; i <= 10; i++) {
    const state = states[(i - 1) % 3]
    patients.push(generateCOPDCase(i, state))
  }
  
  for (let i = 1; i <= 10; i++) {
    const state = states[(i - 1) % 3]
    patients.push(generatePsychCase(i, state))
  }
  
  for (let i = 1; i <= 10; i++) {
    const state = states[(i - 1) % 3]
    patients.push(generateOBCase(i, state))
  }
  
  return patients
}

// Export the generated patients
export const allPatients = generateAllPatients()
