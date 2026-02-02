import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function CompliancePage() {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Quality & Compliance</h1>
            <p className="text-sm text-muted-foreground">Monitor quality metrics and regulatory compliance</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Compliance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">98.5%</div>
                <p className="text-sm text-muted-foreground mt-1">Above industry standard</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">94.2%</div>
                <p className="text-sm text-muted-foreground mt-1">Patient satisfaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Open Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">3</div>
                <p className="text-sm text-muted-foreground mt-1">Require attention</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                HIPAA Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Privacy Rule Compliance</span>
                  <Badge variant="success">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Security Rule Compliance</span>
                  <Badge variant="success">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Breach Notification Rule</span>
                  <Badge variant="success">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enforcement Rule</span>
                  <Badge variant="warning">Under Review</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Quarterly Security Assessment</p>
                    <p className="text-muted-foreground">Completed on 02/15/2025 - No issues found</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Patient Data Access Review</p>
                    <p className="text-muted-foreground">Completed on 02/01/2025 - All access logged appropriately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Documentation Quality Check</p>
                    <p className="text-muted-foreground">In Progress - Due 03/01/2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
