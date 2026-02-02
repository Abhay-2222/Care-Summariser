"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { useToast } from "@/hooks/use-toast"
import { Wand2, Download, Copy, Eye } from "lucide-react"

export function PriorAuthComposer() {
  const { selectedPatient } = useApp()
  const { toast } = useToast()
  const [generatedText, setGeneratedText] = useState("")
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
      <div className="bg-white rounded-lg border border-slate-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-slate-800">Prior Authorization</h2>
          <Badge variant="secondary" className="text-[10px] h-5">{selectedPatient.insurance}</Badge>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Patient</p>
              <p className="text-[12px] text-slate-700 mt-0.5">{selectedPatient.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">MRN</p>
              <p className="text-[12px] text-slate-700 mt-0.5">{selectedPatient.mrn}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Primary Diagnosis</p>
              <p className="text-[12px] text-slate-700 mt-0.5">{selectedPatient.diagnoses[0]}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Length of Stay</p>
              <p className="text-[12px] text-slate-700 mt-0.5">{selectedPatient.lengthOfStay}</p>
            </div>
          </div>

          {!generatedText ? (
            <div className="flex flex-col items-center justify-center py-10 border-t border-slate-100 mt-4">
              <Wand2 className="mb-3 h-8 w-8 text-slate-300" />
              <h3 className="text-[13px] font-medium text-slate-700 mb-1">Generate Prior Authorization</h3>
              <p className="text-[11px] text-slate-400 text-center mb-4 max-w-sm">
                AI will compose a prior authorization letter based on clinical documentation
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating} size="sm" className="gap-2 text-[11px] h-8">
                <Wand2 className="h-3.5 w-3.5" />
                {isGenerating ? "Generating..." : "Generate Authorization"}
              </Button>
            </div>
          ) : (
<div className="space-y-3 border-t border-slate-100 mt-4 pt-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleGenerate} variant="outline" size="sm" className="gap-1.5 bg-transparent text-[11px] h-7">
                  <Wand2 className="h-3 w-3" />
                  Regenerate
                </Button>
                <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5 bg-transparent text-[11px] h-7">
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent text-[11px] h-7">
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
                <Button size="sm" className="ml-auto gap-1.5 text-[11px] h-7">
                  <Download className="h-3 w-3" />
                  Submit
                </Button>
              </div>
              <Textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="min-h-[400px] font-mono text-[11px] leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
