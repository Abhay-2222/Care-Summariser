"use client"

import React from "react"

import { useMemo } from "react"
import { AppHeader } from "@/components/app-header"
import { useApp } from "@/lib/app-context"
import { statusConfig } from "@/lib/workflow-utils"
import type { CaseStatus } from "@/lib/types"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText,
  ArrowRight,
  Activity,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendUp,
  icon: Icon,
}: { 
  title: string
  value: string | number
  subtitle?: string
  trend?: string
  trendUp?: boolean
  icon: React.ElementType
}) {
  
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-ds-xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-overline text-[var(--neutral-500)]">{title}</p>
          <p className="text-clinical-val text-2xl text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-caption text-[var(--neutral-500)] mt-0.5">{subtitle}</p>}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-ds-badge",
              trendUp ? "text-[var(--success)]" : "text-[var(--destructive)]"
            )}>
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-[var(--neutral-100)] text-[var(--neutral-600)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-body-sm text-[var(--neutral-700)] w-36">{label}</span>
      <div className="flex-1 h-2 bg-[var(--neutral-150)] rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-label-sm text-foreground w-8 text-right">{count}</span>
    </div>
  )
}

export default function AuditPage() {
  const { patients, auditLog, getAuditStats, currentRole, hasPermission } = useApp()
  const stats = getAuditStats()

  const recentActivity = useMemo(() => {
    return patients
      .filter(p => p.workflow.statusHistory.length > 0)
      .flatMap(p => p.workflow.statusHistory.map(sh => ({ ...sh, patientName: p.name, patientId: p.id })))
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, 10)
  }, [patients])

  const casesByInsurance = useMemo(() => {
    const byInsurance: Record<string, number> = {}
    patients.forEach(p => {
      byInsurance[p.insurance] = (byInsurance[p.insurance] || 0) + 1
    })
    return Object.entries(byInsurance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [patients])

  const physicianWorkload = useMemo(() => {
    const workload: Record<string, { pending: number; approved: number; total: number }> = {}
    patients.forEach(p => {
      if (p.workflow.physicianDecision) {
        const name = p.workflow.physicianDecision.decidedBy
        if (!workload[name]) workload[name] = { pending: 0, approved: 0, total: 0 }
        workload[name].total++
        if (p.workflow.physicianDecision.decision === "approved") workload[name].approved++
      }
      if (p.workflow.status === "needs_physician" && p.workflow.assignment) {
        const name = "Pending Review"
        if (!workload[name]) workload[name] = { pending: 0, approved: 0, total: 0 }
        workload[name].pending++
      }
    })
    return Object.entries(workload)
  }, [patients])

  if (!hasPermission("view_audit_log")) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-[var(--warning)] mx-auto mb-4" />
            <h2 className="text-heading-md text-foreground">Access Restricted</h2>
            <p className="text-body-md text-[var(--neutral-500)] mt-1">This page is only available to Auditors.</p>
            <p className="text-body-sm text-[var(--neutral-500)] mt-2">Switch to Auditor role in the header to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-lg text-foreground">Audit Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="h-8 text-label-sm gap-1.5"
                onClick={() => {
                  const header = "timestamp,user,role,action,patientId"
                  const rows = auditLog.map((entry) =>
                    [entry.timestamp, entry.user, entry.role ?? "", entry.action, entry.patientId ?? ""].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
                  )
                  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement("a")
                  link.href = url
                  link.download = "audit.csv"
                  link.click()
                  URL.revokeObjectURL(url)
                }}
              >
                <FileText className="h-3.5 w-3.5" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Total Cases" 
              value={stats.totalCases} 
              subtitle="Active in system"
              icon={FileText}
            />
            <StatCard 
              title="Approval Rate" 
              value={`${stats.approvalRate}%`} 
              subtitle={`${stats.byStatus.approved || 0} of ${(stats.byStatus.approved || 0) + (stats.byStatus.denied || 0)} decided`}
              icon={CheckCircle2}
            />
            <StatCard 
              title="Denial Rate" 
              value={`${stats.denialRate}%`} 
              subtitle={`${stats.byStatus.denied || 0} of ${(stats.byStatus.approved || 0) + (stats.byStatus.denied || 0)} decided`}
              icon={XCircle}
            />
          </div>

          {/* Status Distribution + Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-ds-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading-sm text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[var(--neutral-400)]" />
                  Case Status Distribution
                </h3>
                <span className="text-caption text-[var(--neutral-500)]">{stats.totalCases} total</span>
              </div>
              <div className="flex flex-col gap-3">
                <StatusBar label="New" count={stats.byStatus.new || 0} total={stats.totalCases} color="bg-[var(--neutral-500)]" />
                <StatusBar label="In Progress" count={stats.byStatus.in_progress || 0} total={stats.totalCases} color="bg-[var(--neutral-500)]" />
                <StatusBar label="With physician" count={stats.byStatus.needs_physician || 0} total={stats.totalCases} color="bg-[var(--neutral-500)]" />
                <StatusBar label="Escalated" count={stats.byStatus.escalated || 0} total={stats.totalCases} color="bg-[var(--status-error-text)]" />
                <StatusBar label="Signed off" count={stats.byStatus.ready || 0} total={stats.totalCases} color="bg-[var(--neutral-500)]" />
                <StatusBar label="Submitted" count={stats.byStatus.submitted || 0} total={stats.totalCases} color="bg-[var(--neutral-500)]" />
                <StatusBar label="Approved" count={stats.byStatus.approved || 0} total={stats.totalCases} color="bg-[var(--neutral-500)]" />
                <StatusBar label="Denied" count={stats.byStatus.denied || 0} total={stats.totalCases} color="bg-[var(--status-error-text)]" />
              </div>
            </div>

            {/* Cases by Insurance */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-ds-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading-sm text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--neutral-400)]" />
                  Cases by Insurance
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {casesByInsurance.map(([insurance, count]) => (
                  <StatusBar 
                    key={insurance} 
                    label={insurance} 
                    count={count} 
                    total={stats.totalCases} 
                    color="bg-[var(--brand-500)]" 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Alerts + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Alerts - Reframed */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-ds-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                  Action Items
                </h3>
                <span className="text-ds-badge px-2 py-0.5 rounded bg-[var(--status-warn-bg)] text-[var(--status-warn-text)]">
                  {stats.pendingPhysician} pending
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {stats.pendingPhysician > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--status-warn-bg)] border border-[var(--status-warn-border)]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[var(--warning)]" />
                      <span className="text-body-sm text-foreground">Cases awaiting physician review</span>
                    </div>
                    <span className="text-clinical-val text-[var(--status-warn-text)]">{stats.pendingPhysician}</span>
                  </div>
                )}
                {stats.readyForSubmission > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--status-ok-bg)] border border-[var(--status-ok-border)]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[var(--success)]" />
                      <span className="text-body-sm text-foreground">Cases ready for submission</span>
                    </div>
                    <span className="text-clinical-val text-[var(--status-ok-text)]">{stats.readyForSubmission}</span>
                  </div>
                )}
                {(stats.byStatus.denied || 0) > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--status-error-bg)] border border-[var(--status-error-border)]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[var(--destructive)]" />
                      <span className="text-body-sm text-foreground">Denied cases requiring appeal</span>
                    </div>
                    <span className="text-clinical-val text-[var(--status-error-text)]">{stats.byStatus.denied || 0}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-ds-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading-sm text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[var(--neutral-400)]" />
                  Recent Activity
                </h3>
                <Link href="/" className="text-caption text-[var(--brand-500)] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                {recentActivity.slice(0, 6).map((activity, idx) => {
                  const fromConfig = statusConfig[activity.from]
                  const toConfig = statusConfig[activity.to]
                  return (
                    <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-foreground truncate">{activity.patientName}</p>
                        <p className="text-caption text-[var(--neutral-500)]">
                          {fromConfig.label} → {toConfig.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-caption text-[var(--neutral-500)]">{activity.changedBy}</p>
                        <p className="text-caption text-[var(--neutral-500)]">
                          {new Date(activity.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {recentActivity.length === 0 && (
                  <p className="text-body-sm text-[var(--neutral-500)] text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center py-4">
            <p className="text-caption text-[var(--neutral-500)]">
              Data refreshes automatically. Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
