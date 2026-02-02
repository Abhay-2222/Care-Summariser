import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plug, AlertTriangle, XCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

type IntegrationStatus = "connected" | "partial" | "failed" | "disconnected"

interface Integration {
  id: string
  name: string
  description: string
  status: IntegrationStatus
  lastSync?: string
  syncHealth?: number
  records?: number
  error?: string
}

const integrations: Integration[] = [
  {
    id: "1",
    name: "Epic EHR",
    description: "Electronic Health Records",
    status: "connected",
    lastSync: "2 minutes ago",
    syncHealth: 100,
    records: 1247,
  },
  {
    id: "2",
    name: "Availity Payer Platform",
    description: "Insurance Verification",
    status: "partial",
    lastSync: "15 minutes ago",
    syncHealth: 78,
    records: 342,
    error: "Some payer connections experiencing delays",
  },
  {
    id: "3",
    name: "Cerner Millennium",
    description: "Clinical Data Exchange",
    status: "failed",
    lastSync: "3 hours ago",
    syncHealth: 0,
    error: "Authentication token expired. Re-authentication required.",
  },
  {
    id: "4",
    name: "Surescripts",
    description: "ePrescribing Network",
    status: "disconnected",
  },
  {
    id: "5",
    name: "Change Healthcare",
    description: "Claims Processing",
    status: "disconnected",
  },
]

function TrafficLightIndicator({ status }: { status: IntegrationStatus }) {
  const config = {
    connected: { color: "bg-emerald-500", pulse: false, label: "Synced" },
    partial: { color: "bg-amber-500", pulse: true, label: "Partial" },
    failed: { color: "bg-red-500", pulse: true, label: "Failed" },
    disconnected: { color: "bg-gray-400", pulse: false, label: "Offline" },
  }
  const { color, pulse, label } = config[status]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn("h-3 w-3 rounded-full", color)} />
        {pulse && (
          <div className={cn("absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-75", color)} />
        )}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const statusConfig = {
    connected: { border: "border-emerald-500/30", bg: "bg-emerald-500/5" },
    partial: { border: "border-amber-500/30", bg: "bg-amber-500/5" },
    failed: { border: "border-red-500/30", bg: "bg-red-500/5" },
    disconnected: { border: "border-border", bg: "bg-background" },
  }
  const { border, bg } = statusConfig[integration.status]

  return (
    <Card className={cn(border, bg)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg p-2",
                integration.status === "disconnected" ? "bg-muted" : "bg-primary/10",
              )}
            >
              <Plug
                className={cn(
                  "h-5 w-5",
                  integration.status === "disconnected" ? "text-muted-foreground" : "text-primary",
                )}
              />
            </div>
            <div>
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
          <TrafficLightIndicator status={integration.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {integration.status !== "disconnected" ? (
          <>
            {integration.error && (
              <div
                className={cn(
                  "flex items-start gap-2 rounded-md p-2 text-xs",
                  integration.status === "failed"
                    ? "bg-red-500/10 text-red-600"
                    : "bg-amber-500/10 text-amber-600",
                )}
              >
                {integration.status === "failed" ? (
                  <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                )}
                <span>{integration.error}</span>
              </div>
            )}
            <div className="text-sm space-y-2">
              {integration.lastSync && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="font-medium">{integration.lastSync}</span>
                </div>
              )}
              {integration.records !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Records:</span>
                  <span className="font-medium">{integration.records.toLocaleString()}</span>
                </div>
              )}
              {integration.syncHealth !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sync Health</span>
                    <span className="font-medium">{integration.syncHealth}%</span>
                  </div>
                  <Progress
                    value={integration.syncHealth}
                    className={cn(
                      "h-1.5",
                      integration.syncHealth === 100 && "[&>div]:bg-emerald-500",
                      integration.syncHealth > 0 && integration.syncHealth < 100 && "[&>div]:bg-amber-500",
                      integration.syncHealth === 0 && "[&>div]:bg-red-500",
                    )}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {integration.status === "failed" ? (
                <Button size="sm" className="w-full gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reconnect
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Configure
                </Button>
              )}
            </div>
          </>
        ) : (
          <Button size="sm" className="w-full">
            Connect Integration
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function IntegrationsPage() {
  const connectedCount = integrations.filter((i) => i.status === "connected").length
  const partialCount = integrations.filter((i) => i.status === "partial").length
  const failedCount = integrations.filter((i) => i.status === "failed").length

  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Integration Management</h1>
              <p className="text-sm text-muted-foreground">Configure and monitor external system connections</p>
            </div>
            {/* Summary badges */}
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                {connectedCount} Connected
              </Badge>
              {partialCount > 0 && (
                <Badge variant="outline" className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  {partialCount} Partial
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="outline" className="gap-1.5 border-red-500/30 bg-red-500/10 text-red-600">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  {failedCount} Failed
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
