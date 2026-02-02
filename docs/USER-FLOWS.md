# CareSummarizer AI - Complete User Flows & Component Documentation

## System Architecture Overview

CareSummarizer is a Prior Authorization (PA) workflow management system with three user roles:
- **Case Manager (CM)**: Primary workflow driver
- **Physician (MD)**: Clinical approval authority  
- **Auditor**: Compliance monitoring (read-only)

---

## COMPONENT INVENTORY

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AppHeader` | `/components/app-header.tsx` | Navigation, role switcher, session timer, notifications |
| `PatientListPanel` | `/components/patient-list-panel.tsx` | Patient queue sidebar with filtering |
| `ClinicalSummaryView` | `/components/clinical-summary-view.tsx` | Main patient review interface |
| `CareLensDrawer` | `/components/care-lens-drawer.tsx` | AI analysis panel |
| `PhysicianApprovalModal` | `/components/physician-approval-modal.tsx` | MD decision interface |
| `NotificationCenter` | `/components/notification-center.tsx` | Real-time alerts |
| `EvidencePanel` | `/components/evidence-panel.tsx` | Document management |
| `AppealsPanel` | `/components/appeals-panel.tsx` | Denial management |
| `CollaborationPanel` | `/components/collaboration-panel.tsx` | Team communication |
| `PriorAuthComposer` | `/components/prior-auth-composer.tsx` | PA document generation |

### Pages

| Page | Route | Purpose |
|------|-------|---------|
| Queue | `/` | Main patient queue view |
| Patient Detail | `/patient/[id]` | Full patient review with tabs |
| Dashboard | `/dashboard` | Metrics overview |
| Medical Director | `/medical-director` | Escalated case queue |
| Audit | `/audit` | Compliance dashboard |
| Appeals | `/appeals` | Appeal management |

---

## COMPLETE USER FLOWS

### Flow 1: Case Manager - New Case to PA Submission

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CASE MANAGER WORKFLOW                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. LOGIN                                                                    │
│     └─> Land on Queue (/)                                                   │
│         └─> See PatientListPanel with cases sorted by urgency               │
│                                                                              │
│  2. SELECT PATIENT                                                          │
│     └─> Click patient card in queue                                         │
│         └─> Navigate to /patient/[id]                                       │
│             └─> ClinicalSummaryView loads                                   │
│                                                                              │
│  3. REVIEW CASE                                                             │
│     └─> See workflow status banner (New/In Progress/etc.)                   │
│     └─> Review patient demographics                                         │
│     └─> Check missing documentation alerts (amber cards)                    │
│         └─> Click "Request" → Toast: "Documentation Requested"              │
│             └─> NEXT ACTOR: Clinical staff receives request                 │
│                                                                              │
│  4. CLAIM CASE (if status = "new")                                          │
│     └─> Click "Claim" button                                                │
│         └─> Status changes: new → in_progress                               │
│         └─> Assignment updates to current user                              │
│         └─> Toast: "Case Claimed"                                           │
│                                                                              │
│  5. OPEN CARELENS                                                           │
│     └─> Click "Open CareLens" in tab bar                                    │
│         └─> CareLensDrawer slides in from right                             │
│         └─> See: Confidence scores, Risk Factors, Policy Gaps               │
│                                                                              │
│  6. REVIEW AI ANALYSIS                                                      │
│     └─> Expand "Evidence Quality" → See 4 factors with checkmarks           │
│     └─> Expand "Policy Alignment" → See payer-specific criteria             │
│     └─> Expand "Risk Factors" → For each risk:                              │
│         └─> Click "Why this?" → Chat explains reasoning                     │
│         └─> Click "Resolved" → Risk marked addressed                        │
│         └─> Click "Not right for this patient" → Override logged            │
│                                                                              │
│  7. USE CHAT (Ask CareLens)                                                 │
│     └─> Type question or click quick action                                 │
│     └─> Quick actions: "Why this score?", "Draft request", "Similar cases"  │
│     └─> AI responds with explanation + action buttons                       │
│                                                                              │
│  8. SEND TO PHYSICIAN                                                       │
│     └─> Click "Send to MD" button (when status = in_progress)               │
│         └─> SendToMDSheet opens                                             │
│         └─> Review items requiring MD attention                             │
│         └─> Add optional notes                                              │
│         └─> Click "Send to Physician"                                       │
│             └─> Status changes: in_progress → needs_physician               │
│             └─> Toast: "Sent to Physician"                                  │
│             └─> NEXT ACTOR: Physician receives notification                 │
│                                                                              │
│  9. WAIT FOR MD DECISION                                                    │
│     └─> Receive notification when MD responds                               │
│     └─> Three possible outcomes:                                            │
│         ├─> APPROVED → Status: ready → Continue to step 10                  │
│         ├─> DEFERRED → Status: in_progress → Return to step 3               │
│         └─> ESCALATED → Status: escalated → Medical Director reviews        │
│                                                                              │
│  10. SUBMIT PA (when status = ready)                                        │
│      └─> Click "Submit PA" button                                           │
│          └─> Confirmation dialog                                            │
│          └─> Click confirm                                                  │
│              └─> Status changes: ready → submitted                          │
│              └─> Toast: "PA Submitted"                                      │
│              └─> Receive confirmation number                                │
│              └─> NEXT ACTOR: Payer receives PA                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Physician - Case Review and Decision

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHYSICIAN WORKFLOW                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. LOGIN                                                                    │
│     └─> Land on Queue (/) filtered to "Needs MD" cases                      │
│     └─> See notification badge with pending reviews                         │
│                                                                              │
│  2. SELECT CASE                                                             │
│     └─> Click patient card                                                  │
│         └─> Navigate to /patient/[id]                                       │
│         └─> ClinicalSummaryView in READ-ONLY mode                           │
│                                                                              │
│  3. REVIEW CLINICAL DATA                                                    │
│     └─> Patient demographics (read-only)                                    │
│     └─> Diagnoses and procedures                                            │
│     └─> AI-generated summary                                                │
│     └─> View CareLens analysis (read-only, no actions)                      │
│                                                                              │
│  4. OPEN APPROVAL MODAL                                                     │
│     └─> Click "Review for Approval" button                                  │
│         └─> PhysicianApprovalModal opens                                    │
│                                                                              │
│  5. REVIEW IN MODAL                                                         │
│     └─> Patient summary card                                                │
│     └─> CareLens confidence summary                                         │
│     └─> "Blocking Approval" section (if risks/gaps exist)                   │
│     └─> "Your Review Validates" section                                     │
│                                                                              │
│  6A. HIGH CONFIDENCE PATH (2-minute approve)                                │
│      └─> If all criteria met + high confidence:                             │
│          └─> Green banner: "Everything needed for safe approval"            │
│          └─> Click "Approve & Next Case"                                    │
│              └─> Status: needs_physician → ready                            │
│              └─> NEXT ACTOR: Case Manager receives notification             │
│                                                                              │
│  6B. STANDARD APPROVAL                                                      │
│      └─> Click "Approve" button                                             │
│          └─> Optional: Add clinical notes                                   │
│          └─> Confirm attestation                                            │
│          └─> Status: needs_physician → ready                                │
│          └─> NEXT ACTOR: Case Manager receives notification                 │
│                                                                              │
│  6C. DEFER (needs more info)                                                │
│      └─> Click "Defer" button                                               │
│          └─> REQUIRED: Enter reason (what's missing)                        │
│          └─> Click confirm                                                  │
│          └─> Status: needs_physician → in_progress                          │
│          └─> NEXT ACTOR: Case Manager receives deferral with notes          │
│                                                                              │
│  6D. ESCALATE (complex decision)                                            │
│      └─> Click "Escalate" button                                            │
│          └─> REQUIRED: Enter clinical complexity reason                     │
│          └─> Click confirm                                                  │
│          └─> Status: needs_physician → escalated                            │
│          └─> NEXT ACTOR: Medical Director receives notification             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: Medical Director - Escalated Case Review

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MEDICAL DIRECTOR WORKFLOW                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. ACCESS ESCALATED QUEUE                                                  │
│     └─> Navigate to /medical-director                                       │
│     └─> See list of escalated cases with:                                   │
│         - Escalation reason                                                 │
│         - Escalating physician                                              │
│         - Case complexity indicators                                        │
│                                                                              │
│  2. REVIEW CASE                                                             │
│     └─> Click case card                                                     │
│     └─> Full clinical review + escalation context                           │
│                                                                              │
│  3. MAKE DECISION                                                           │
│     └─> Option A: Approve with Override                                     │
│         └─> Document override justification                                 │
│         └─> Status: escalated → ready                                       │
│         └─> NEXT ACTOR: Case Manager                                        │
│                                                                              │
│     └─> Option B: Deny with Documentation                                   │
│         └─> Document clinical reasoning                                     │
│         └─> Status: escalated → denied                                      │
│         └─> NEXT ACTOR: Case Manager for appeal                             │
│                                                                              │
│     └─> Option C: Request Additional Consult                                │
│         └─> Specify consult needed                                          │
│         └─> Status remains escalated                                        │
│         └─> NEXT ACTOR: Original physician                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 4: Auditor - Compliance Review

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ AUDITOR WORKFLOW                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. ACCESS AUDIT DASHBOARD                                                  │
│     └─> Navigate to /audit                                                  │
│     └─> See: Shared Learning System header                                  │
│     └─> View metrics: Approval rates, AI accuracy, turnaround times         │
│                                                                              │
│  2. REVIEW TEAM PERFORMANCE                                                 │
│     └─> "Team Wins" section: What's working well                            │
│     └─> "Improvement Opportunities" section: Patterns to address            │
│     └─> Note: Not individual tracking - team patterns                       │
│                                                                              │
│  3. VIEW ANY CASE (read-only)                                               │
│     └─> Select patient from queue                                           │
│     └─> All views are read-only                                             │
│     └─> CareLens shows "Compliance Report" mode                             │
│     └─> Export button available for audit trail                             │
│                                                                              │
│  4. EXPORT REPORTS                                                          │
│     └─> Click "Export Report" button                                        │
│     └─> Select date range and metrics                                       │
│     └─> Download PDF/CSV                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## STATUS TRANSITIONS

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          CASE STATUS STATE MACHINE                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ┌─────────┐                                    │
│                              │   NEW   │                                    │
│                              └────┬────┘                                    │
│                                   │ CM claims                               │
│                                   ▼                                         │
│                           ┌─────────────┐                                   │
│                    ┌──────│ IN_PROGRESS │◄─────────────┐                    │
│                    │      └──────┬──────┘              │                    │
│                    │             │ CM sends to MD      │ MD defers          │
│                    │             ▼                     │                    │
│                    │      ┌───────────────┐            │                    │
│                    │      │ NEEDS_PHYSICIAN│───────────┘                    │
│                    │      └───────┬───────┘                                 │
│                    │              │                                         │
│            ┌───────┴───────┬──────┴──────┬─────────┐                        │
│            │               │             │         │                        │
│            ▼               ▼             ▼         │                        │
│      ┌──────────┐   ┌───────────┐  ┌──────────┐   │                        │
│      │ ESCALATED│   │   READY   │  │  DENIED  │   │                        │
│      └────┬─────┘   └─────┬─────┘  └────┬─────┘   │                        │
│           │               │             │         │                        │
│           │ MD decides    │ CM submits  │ Appeal  │                        │
│           ▼               ▼             ▼         │                        │
│      ┌─────────┐    ┌───────────┐  ┌──────────┐  │                        │
│      │  READY  │    │ SUBMITTED │  │ APPEALED │──┘                        │
│      └─────────┘    └───────────┘  └──────────┘                            │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## COMPONENT ACTIONS & NEXT ACTORS

### ClinicalSummaryView Actions

| Action | Button/Trigger | Status Change | Next Actor |
|--------|---------------|---------------|------------|
| Claim Case | "Claim" button | new → in_progress | Self (CM) |
| Request Doc | "Request" on alert | None | Clinical Staff |
| Send to MD | "Send to MD" button | in_progress → needs_physician | Physician |
| Submit PA | "Submit PA" button | ready → submitted | Payer |
| Regenerate Summary | Refresh icon | None | AI (auto) |
| Export | Export button | None | Self |

### PhysicianApprovalModal Actions

| Action | Button | Status Change | Next Actor |
|--------|--------|---------------|------------|
| Approve | "Approve" / "Approve & Next" | needs_physician → ready | Case Manager |
| Defer | "Defer" | needs_physician → in_progress | Case Manager |
| Escalate | "Escalate" | needs_physician → escalated | Medical Director |

### CareLensDrawer Actions

| Action | Button/Trigger | Effect | Next Actor |
|--------|---------------|--------|------------|
| Expand Confidence | Click score row | Shows factor breakdown | Self |
| Why this? | Risk factor button | Chat explains reasoning | Self |
| Resolved | Risk factor button | Marks risk addressed | Self |
| Override | "Not right for this patient" | Logs override + feedback | Self |
| Ask Question | Chat input | AI responds | Self |
| Quick Action | Chat button | AI performs action | Self |

### PatientListPanel Actions

| Action | Trigger | Effect | Next Actor |
|--------|---------|--------|------------|
| Select Patient | Click card | Navigate to patient detail | Self |
| Filter by Status | Click filter chip | Filter queue | Self |
| Filter by Urgency | Click urgency chip | Filter queue | Self |
| Search | Type in search | Filter by name/MRN | Self |
| Bulk Select | Checkbox | Select multiple | Self |
| Claim Selected | "Claim" button | Bulk claim cases | Self |

### NotificationCenter Actions

| Notification Type | Click Action | Navigation |
|-------------------|--------------|------------|
| PA Approved | View Details | /prior-auth |
| Deadline Warning | Review Case | /patient/[id] |
| Case Escalated | View Escalation | /medical-director |
| P2P Scheduled | View Details | /medical-director |
| Team Message | View Note | /patient/[id] |

---

## ROLE-BASED ACCESS MATRIX

| Feature | Case Manager | Physician | Auditor |
|---------|--------------|-----------|---------|
| View Queue | Yes (all) | Yes (Needs MD only) | Yes (read-only) |
| Claim Cases | Yes | No | No |
| Edit Clinical Data | Yes | No | No |
| Send to MD | Yes | No | No |
| Approve/Defer/Escalate | No | Yes | No |
| Submit PA | Yes | Yes | No |
| CareLens Chat | Yes | No | No |
| CareLens Actions | Yes | No | No |
| Export Reports | Yes | Yes | Yes |
| View Audit Dashboard | No | No | Yes |

---

## NOTIFICATION TRIGGERS

| Event | Recipient | Message |
|-------|-----------|---------|
| Case claimed | - | (No notification) |
| Sent to physician | Physician | "Case ready for review: [Patient]" |
| MD approved | Case Manager | "[Patient] approved - ready for PA" |
| MD deferred | Case Manager | "Case deferred: [Reason]" |
| MD escalated | Medical Director | "Case escalated: [Reason]" |
| PA submitted | - | (Confirmation only) |
| PA decision received | Case Manager | "PA [Approved/Denied] by [Payer]" |
| Deadline approaching | Case Manager | "[Patient] deadline in [X] hours" |
| @Mention | Mentioned user | "[User] mentioned you in [Patient]" |

---

## DATA FLOW SUMMARY

```
Patient Data (app-context.tsx)
    │
    ├── PatientListPanel (displays queue)
    │
    ├── ClinicalSummaryView (displays detail)
    │   ├── Demographics
    │   ├── Diagnoses  
    │   ├── Payer Rules
    │   ├── Alerts (missing docs)
    │   └── AI Summary
    │
    └── CareLensDrawer (AI analysis)
        ├── Confidence Scores → ExplainableConfidence
        ├── Risk Factors → RiskBadge
        ├── Policy Gaps
        ├── Recommendations
        └── Chat (Ask CareLens)

Workflow Functions (app-context.tsx)
    ├── claimCase(patientId)
    ├── sendToPhysician(patientId)
    ├── physicianApprove(patientId, notes)
    ├── physicianDefer(patientId, notes)
    ├── physicianEscalate(patientId, notes)
    ├── submitPA(patientId)
    ├── updateRiskFactorStatus(riskId, status, reason)
    ├── requestDocumentation(alertId)
    └── regenerateSummary()
```

---

## IDENTIFIED REDUNDANCIES & OPTIMIZATION NOTES

### Removed/Consolidated:
1. `MiniGauge` component → Replaced with `ExplainableConfidence`
2. Duplicate import statements cleaned up
3. Unused Sparkles, Shield, TrendingUp icons removed
4. ScrollArea import removed where flex overflow is sufficient

### UI Optimizations Made:
1. CareLens header toned down from gradient to subtle slate
2. Chat section simplified - removed heavy "Coach" personality
3. Confidence breakdown now shows actual factors, not just percentages
4. Quick actions use subtle slate pills instead of purple badges

### Potential Future Optimizations:
1. Consolidate similar badge components across files
2. Extract common status color logic into shared utility
3. Consider lazy loading for heavy components like CareLensDrawer
4. Add virtualization to PatientListPanel for large queues
