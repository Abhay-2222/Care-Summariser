"use client"

import { useParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { PatientListPanel } from "@/components/patient-list-panel"
import { CareLensDrawer } from "@/components/care-lens-drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClinicalSummaryView } from "@/components/clinical-summary-view"
import { PriorAuthComposer } from "@/components/prior-auth-composer"
import { EvidencePanel } from "@/components/evidence-panel"
import { AppealsPanel } from "@/components/appeals-panel"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { Activity, FileText, Search, RefreshCw, Loader2, Brain, Eye, BarChart3, MessageSquare } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { useEffect, useState, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Tab context to allow child components to switch tabs
const TabContext = createContext<{
  activeTab: string
  setActiveTab: (tab: string) => void
}>({ activeTab: "clinical-summary", setActiveTab: () => {} })

// CareLens context for opt-in drawer
const CareLensContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({ isOpen: false, setIsOpen: () => {} })

export const useTabContext = () => useContext(TabContext)
export const useCareLensContext = () => useContext(CareLensContext)

export default function PatientDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { setSelectedPatientId, selectedPatient, currentRole, careLensOpen, setCareLensOpen } = useApp()
  const [activeTab, setActiveTab] = useState("clinical-summary")

  useEffect(() => {
    if (id) {
      setSelectedPatientId(id)
    }
  }, [id, setSelectedPatientId])

  // Loading state (Heuristic #1: Visibility of system status)
  if (!selectedPatient) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <PatientListPanel />
          <main className="flex flex-1 items-center justify-center bg-muted/30">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading patient...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const tabItems = [
    { value: "clinical-summary", icon: Activity, label: "Summary", shortcut: "1" },
    { value: "prior-auth", icon: FileText, label: "Prior Auth", shortcut: "2" },
    { value: "evidence", icon: Search, label: "Evidence", shortcut: "3" },
    { value: "appeals", icon: RefreshCw, label: "Appeals", shortcut: "4" },
    { value: "collaboration", icon: MessageSquare, label: "Team", shortcut: "5" },
  ]

  // Role-specific CareLens button config
  const careLensButtonConfig = {
    case_manager: { icon: Brain, label: "Open CareLens", description: "Full interactive analysis" },
    physician: { icon: Eye, label: "View Analysis", description: "Read-only case analysis" },
    auditor: { icon: BarChart3, label: "Analysis Report", description: "Export & audit data" },
  }
  const careLensButton = careLensButtonConfig[currentRole]

  return (
    <CareLensContext.Provider value={{ isOpen: careLensOpen, setIsOpen: setCareLensOpen }}>
      <TabContext.Provider value={{ activeTab, setActiveTab }}>
        <div className="flex h-screen flex-col bg-slate-100">
          <AppHeader />
          <div className="flex flex-1 overflow-hidden">
            <PatientListPanel />
            <main className="flex-1 overflow-hidden flex flex-col bg-slate-100">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                {/* Compact tab bar with CareLens toggle */}
                <div className="border-b border-slate-200 bg-white px-3 py-1.5 flex-shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    {/* Icon-driven tabs */}
                    <TabsList className="h-8 bg-slate-100 p-0.5 rounded-md">
                      <TooltipProvider delayDuration={0}>
                        {tabItems.map((tab) => {
                          const Icon = tab.icon
                          return (
                            <Tooltip key={tab.value}>
                              <TooltipTrigger asChild>
                                <TabsTrigger 
                                  value={tab.value} 
                                  className="h-7 px-2.5 gap-1.5 rounded text-[11px] data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  <span className="hidden md:inline">{tab.label}</span>
                                </TabsTrigger>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="text-[10px]">
                                {tab.label}
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </TooltipProvider>
                    </TabsList>

                    {/* CareLens Toggle Button */}
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={careLensOpen ? "default" : "outline"}
                            size="sm"
                            className={`h-8 gap-1.5 text-[11px] ${careLensOpen ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-transparent hover:bg-purple-50 text-purple-600 border-purple-200"}`}
                            onClick={() => setCareLensOpen(!careLensOpen)}
                          >
                            <careLensButton.icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{careLensButton.label}</span>
                            {!careLensOpen && selectedPatient?.careLens?.policyGaps?.filter(g => g.status === "open").length > 0 && (
                              <span className="ml-1 h-4 w-4 rounded-full bg-amber-500 text-[9px] text-white flex items-center justify-center">
                                {selectedPatient.careLens.policyGaps.filter(g => g.status === "open").length}
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px]">
                          {careLensButton.description}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <TabsContent value="clinical-summary" className="m-0 flex-1 overflow-hidden">
                  <ClinicalSummaryView />
                </TabsContent>
                <TabsContent value="prior-auth" className="m-0 flex-1 overflow-y-auto p-4">
                  <PriorAuthComposer />
                </TabsContent>
                <TabsContent value="evidence" className="m-0 flex-1 overflow-y-auto p-4">
                  <EvidencePanel />
                </TabsContent>
                <TabsContent value="appeals" className="m-0 flex-1 overflow-y-auto p-4">
                  <AppealsPanel />
                </TabsContent>
                <TabsContent value="collaboration" className="m-0 flex-1 overflow-y-auto p-4">
                  <CollaborationPanel patientId={id} patientName={selectedPatient.name} />
                </TabsContent>
              </Tabs>
            </main>
            
            {/* CareLens Drawer (opt-in) */}
            <CareLensDrawer 
              isOpen={careLensOpen} 
              onClose={() => setCareLensOpen(false)}
              mode={currentRole === "case_manager" ? "full" : "readonly"}
            />
          </div>
        </div>
      </TabContext.Provider>
    </CareLensContext.Provider>
  )
}
