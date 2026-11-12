"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/app-context"
import { useToast } from "@/hooks/use-toast"
import { Wand2, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { typography } from "@/lib/design-system"

export function PriorAuthComposer() {
  const { selectedPatient, currentRole } = useApp()
  const readOnly = currentRole === "physician"
  const { toast } = useToast()
  const [generatedText, setGeneratedText] = useState("")
  const [draftEdited, setDraftEdited] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No patient selected</p>
      </div>
    )
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setDraftEdited(false)
      setGeneratedText(
        `PRIOR AUTHORIZATION REQUEST\n\nPatient: ${selectedPatient.name}\nMRN: ${selectedPatient.mrn}\nDOB: [Date of Birth]\nInsurance: ${selectedPatient.insurance}\n\nCLINICAL INFORMATION:\nDiagnosis: ${selectedPatient.diagnoses.join(", ")}\n\nMedical Necessity:\n${selectedPatient.chiefComplaint}\n\nClinical Course:\n${selectedPatient.clinicalCourse}\n\nRequested Services:\n- Continued inpatient care\n- Ongoing monitoring and treatment\n- Planned diagnostic procedures\n\nSupporting Documentation:\n- Clinical notes (${selectedPatient.documentsProcessed} documents)\n- Laboratory results\n- Imaging studies\n- Treatment response documentation\n\nJustification:\nBased on the clinical presentation and response to treatment, continued inpatient care is medically necessary. The patient requires ongoing monitoring and intervention that cannot be safely provided in a lower level of care.`,
      )
      setIsGenerating(false)
      toast({
        title: "Prior Auth Generated",
        description: "Review and edit as needed before submission",
      })
    }, 2000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText)
    toast({
      title: "Copied to Clipboard",
      description: "Prior authorization text has been copied",
    })
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg border border-border">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className={typography.sectionHeader}>Request</p>
          <span className="text-caption text-[var(--neutral-500)]">
            {selectedPatient.insurance}
          </span>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className={typography.label}>Patient</p>
              <p className={cn(typography.title, "mt-0.5")}>{selectedPatient.name}</p>
            </div>
            <div>
              <p className={typography.label}>MRN</p>
              <p className={cn(typography.body, "mt-0.5")}>{selectedPatient.mrn}</p>
            </div>
            <div>
              <p className={typography.label}>Primary diagnosis</p>
              <p className={cn(typography.body, "mt-0.5")}>{selectedPatient.diagnoses[0]}</p>
            </div>
            <div>
              <p className={typography.label}>Length of stay</p>
              <p className={cn(typography.body, "mt-0.5")}>{selectedPatient.lengthOfStay}</p>
            </div>
          </div>

          {!generatedText ? (
            <div className="flex flex-col items-center justify-center py-10 border-t border-border mt-4">
              <h3 className="text-label-md text-foreground mb-3">Draft the request from this case</h3>
              {!readOnly && (
                <Button onClick={handleGenerate} disabled={isGenerating} size="sm" className="h-7 px-3">
                  {isGenerating ? "Drafting..." : "Draft request"}
                </Button>
              )}
            </div>
          ) : (
<div className="space-y-3 border-t border-border mt-4 pt-4">
              {!readOnly && (
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleGenerate} variant="outline" size="sm" className="gap-1.5 bg-transparent h-7">
                    <Wand2 className="h-3 w-3" />
                    Draft again
                  </Button>
                  <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5 bg-transparent h-7">
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              )}
              <p className={typography.meta}>{draftEdited ? "Edited" : "CareLens suggests"} · Demo data</p>
              <Textarea
                value={generatedText}
                onChange={(e) => {
                  setGeneratedText(e.target.value)
                  setDraftEdited(true)
                }}
                readOnly={readOnly}
                className="min-h-[400px] text-body-sm leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
