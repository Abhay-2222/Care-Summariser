"use client"

import { AppHeader } from "@/components/app-header"
import { PatientListPanel } from "@/components/patient-list-panel"
import { WelcomeHero } from "@/components/welcome-hero"
import { useApp } from "@/lib/app-context"
import { Users, ArrowRight, Heart, Clock, Shield, ChevronLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function HomePage() {
  const { currentRole, currentUser, setPatientListOpen, hasSeenSwipeHint, setHasSeenSwipeHint } = useApp()
  const isMobile = useIsMobile()
  
  const handleOpenPatientList = () => {
    setPatientListOpen(true)
    if (!hasSeenSwipeHint) {
      setHasSeenSwipeHint(true)
    }
  }
  
  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <PatientListPanel />
        {/* Empty State with Human-Centered Messaging */}
        <main className="flex flex-1 md:items-center md:justify-center overflow-y-auto bg-slate-100 p-4 pt-6 md:p-6">
          <div className="max-w-lg w-full space-y-4 md:space-y-6">
            {/* Welcome Hero */}
            <WelcomeHero 
              userName={currentUser.name} 
              role={currentRole} 
            />
            
            {/* Select Patient CTA - Clickable on mobile */}
            <button 
              type="button"
              onClick={handleOpenPatientList}
              className="w-full text-center bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all md:cursor-default"
            >
              <div className="mx-auto mb-3 md:mb-4 h-11 w-11 md:h-12 md:w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <h2 className="text-[13px] md:text-[14px] font-semibold text-slate-800 mb-1">Select a Patient to Begin</h2>
              <p className="text-[11px] md:text-[12px] text-slate-500 mb-3 md:mb-4">
                Choose a patient from the queue to access their clinical summary and AI-assisted review.
              </p>
              {/* Different CTA for mobile vs desktop */}
              <div className="hidden md:flex items-center justify-center gap-1.5 text-[11px] text-blue-600">
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Select from the list on the left</span>
              </div>
              <div className="md:hidden flex items-center justify-center gap-1.5 text-[11px] text-white bg-blue-600 rounded-lg py-2 px-4">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Tap to open patient list</span>
              </div>
            </button>
            
            {/* Mobile swipe hint - shown only once */}
            {isMobile && !hasSeenSwipeHint && (
              <div className="md:hidden bg-purple-50 border border-purple-200 rounded-lg p-3 text-center animate-pulse">
                <p className="text-[10px] text-purple-700">
                  <strong>Tip:</strong> Swipe right from the left edge to open patient list anytime
                </p>
              </div>
            )}

            {/* Human-Centered Value Props */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-white border border-slate-200">
                <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <p className="text-[10px] font-medium text-slate-700">Less Time on Forms</p>
                <p className="text-[9px] text-slate-500 mt-0.5">More time with patients</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white border border-slate-200">
                <Shield className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-[10px] font-medium text-slate-700">You Stay in Control</p>
                <p className="text-[9px] text-slate-500 mt-0.5">AI assists, you decide</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white border border-slate-200">
                <Heart className="h-5 w-5 text-rose-500 mx-auto mb-2" />
                <p className="text-[10px] font-medium text-slate-700">Patient-First</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Faster care authorization</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
