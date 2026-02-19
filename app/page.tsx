"use client"

import { AppHeader } from "@/components/app-header"
import { PatientListPanel } from "@/components/patient-list-panel"
import { WelcomeHero } from "@/components/welcome-hero"
import { RoleAwareLayout } from "@/components/role-aware-layout"
import { PhysicianLayout } from "@/components/physician/physician-layout"
import { AuditorLayout } from "@/components/auditor/auditor-layout"
import { useApp } from "@/lib/app-context"
import { Users, ArrowRight, Heart, Clock, Shield, ChevronLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

// Case Manager empty state (no patient selected)
function CaseManagerEmptyState() {
  const { currentRole, currentUser, setPatientListOpen, hasSeenSwipeHint, setHasSeenSwipeHint } = useApp()
  const isMobile = useIsMobile()

  const handleOpenPatientList = () => {
    setPatientListOpen(true)
    if (!hasSeenSwipeHint) {
      setHasSeenSwipeHint(true)
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <PatientListPanel />
      <main className="flex flex-1 md:items-center md:justify-center overflow-y-auto bg-background p-4 pt-6 md:p-6">
        <div className="max-w-lg w-full flex flex-col gap-4 md:gap-6">
          <WelcomeHero userName={currentUser.name} role={currentRole} />

          <button
            type="button"
            onClick={handleOpenPatientList}
            className="w-full text-center bg-card rounded-xl p-5 md:p-6 border border-border shadow-ds-xs hover:border-[var(--brand-300)] hover:shadow-ds-md transition-all md:cursor-default"
          >
            <div className="mx-auto mb-3 md:mb-4 h-11 w-11 md:h-12 md:w-12 rounded-full bg-[var(--brand-50)] flex items-center justify-center">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-[var(--brand-500)]" />
            </div>
            <h2 className="text-heading-sm text-foreground mb-1">Select a patient to begin</h2>
            <p className="text-body-sm text-[var(--neutral-500)] mb-3 md:mb-4">
              Choose a patient from the queue to access their clinical summary and AI-assisted review.
            </p>
            <div className="hidden md:flex items-center justify-center gap-1.5 text-body-sm text-[var(--brand-500)]">
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Select from the list on the left</span>
            </div>
            <div className="md:hidden flex items-center justify-center gap-1.5 text-body-sm text-white bg-[var(--brand-500)] rounded-lg py-2 px-4">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Tap to open patient list</span>
            </div>
          </button>

          {isMobile && !hasSeenSwipeHint && (
            <div className="md:hidden bg-[var(--status-info-bg)] border border-[var(--status-info-border)] rounded-lg p-3 text-center animate-pulse">
              <p className="text-caption text-[var(--status-info-text)]">
                <strong>Tip:</strong> Swipe right from the left edge to open patient list anytime
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-card border border-border shadow-ds-xs">
              <Clock className="h-5 w-5 text-[var(--brand-500)] mx-auto mb-2" />
              <p className="text-overline text-foreground">Less time on forms</p>
              <p className="text-caption text-[var(--neutral-500)] mt-0.5">More time with patients</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-card border border-border shadow-ds-xs">
              <Shield className="h-5 w-5 text-[var(--success)] mx-auto mb-2" />
              <p className="text-overline text-foreground">You stay in control</p>
              <p className="text-caption text-[var(--neutral-500)] mt-0.5">AI assists, you decide</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-card border border-border shadow-ds-xs">
              <Heart className="h-5 w-5 text-[var(--destructive)] mx-auto mb-2" />
              <p className="text-overline text-foreground">Patient-first</p>
              <p className="text-caption text-[var(--neutral-500)] mt-0.5">Faster care authorization</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      <RoleAwareLayout
        nurseView={<CaseManagerEmptyState />}
        physicianView={
          <div className="flex-1 overflow-hidden bg-card">
            <PhysicianLayout />
          </div>
        }
        auditorView={
          <div className="flex-1 overflow-hidden bg-card">
            <AuditorLayout />
          </div>
        }
      />
    </div>
  )
}
