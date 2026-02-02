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
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prior Authorization Composer</CardTitle>
            <Badge variant="secondary">{selectedPatient.insurance}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Patient</Label>
              <p className="mt-1 font-medium">{selectedPatient.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">MRN</Label>
              <p className="mt-1 font-medium">{selectedPatient.mrn}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Primary Diagnosis</Label>
              <p className="mt-1 font-medium">{selectedPatient.diagnoses[0]}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Length of Stay</Label>
              <p className="mt-1 font-medium">{selectedPatient.lengthOfStay}</p>
            </div>
          </div>

          {!generatedText ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Wand2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">Generate Prior Authorization</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                AI will compose a prior authorization letter based on clinical documentation
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                <Wand2 className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Authorization"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleGenerate} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Wand2 className="h-4 w-4" />
                  Regenerate
                </Button>
                <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button size="sm" className="ml-auto gap-2">
                  <Download className="h-4 w-4" />
                  Submit
                </Button>
              </div>
              <Textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
