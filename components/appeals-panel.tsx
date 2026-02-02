"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"

const mockAppeals = [
  {
    id: "1",
    caseNumber: "APP-2026-00142",
    status: "Pending Review",
    submittedDate: "Jan 3, 2026",
    reason: "Initial denial - insufficient medical necessity documentation",
    nextStep: "Submit additional clinical notes",
    dueDate: "Jan 10, 2026",
  },
  {
    id: "2",
    caseNumber: "APP-2025-09887",
    status: "Approved",
    submittedDate: "Dec 15, 2025",
    reason: "Denial of extended stay",
    nextStep: "None - case resolved",
    dueDate: "-",
  },
]

export function AppealsPanel() {
  const { selectedPatient } = useApp()

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No patient selected</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appeals & Resubmission</CardTitle>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              New Appeal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mockAppeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">No Active Appeals</h3>
              <p className="text-center text-sm text-muted-foreground">There are no pending appeals for this patient</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockAppeals.map((appeal) => (
                <Card key={appeal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {appeal.status === "Approved" ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : appeal.status === "Pending Review" ? (
                            <Clock className="h-5 w-5 text-warning" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          )}
                          <h4 className="font-medium">{appeal.caseNumber}</h4>
                          <Badge
                            variant={
                              appeal.status === "Approved"
                                ? "success"
                                : appeal.status === "Pending Review"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {appeal.status}
                          </Badge>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>{" "}
                            <span className="font-medium">{appeal.submittedDate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reason:</span> {appeal.reason}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Step:</span> {appeal.nextStep}
                          </div>
                          {appeal.dueDate !== "-" && (
                            <div>
                              <span className="text-muted-foreground">Due Date:</span>{" "}
                              <span className="font-medium text-warning">{appeal.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {appeal.status === "Pending Review" && (
                        <Button variant="outline" size="sm">
                          Update Appeal
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
