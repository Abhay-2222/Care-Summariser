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
  Calendar,
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
  color = "blue"
}: { 
  title: string
  value: string | number
  subtitle?: string
  trend?: string
  trendUp?: boolean
  icon: React.ElementType
  color?: "blue" | "emerald" | "amber" | "red" | "purple"
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  }
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-[10px] font-medium",
              trendUp ? "text-emerald-600" : "text-red-600"
            )}>
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
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
      <span className="text-[11px] text-slate-600 w-24">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-[11px] font-medium text-slate-700 w-8 text-right">{count}</span>
    </div>
  )
}

export default function AuditPage() {
  const { patients, getAuditStats, currentRole } = useApp()
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

  if (currentRole !== "auditor") {
    return (
      <div className="flex h-screen flex-col bg-slate-100">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800">Access Restricted</h2>
            <p className="text-sm text-slate-500 mt-1">This page is only available to Auditors.</p>
            <p className="text-xs text-slate-400 mt-2">Switch to Auditor role in the header to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Human-Centered Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-100 mb-2">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-slate-800">Shared Learning System</p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  This dashboard helps identify patterns for team improvement, not individual performance tracking. 
                  Every insight here is designed to reduce documentation burden and improve patient outcomes together.
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Audit Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">Team performance and improvement opportunities</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-8 text-[11px] gap-1.5 bg-transparent">
                <Calendar className="h-3.5 w-3.5" />
                Last 30 Days
              </Button>
              <Button className="h-8 text-[11px] gap-1.5 bg-blue-600 hover:bg-blue-700">
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
              color="blue"
            />
            <StatCard 
              title="Approval Rate" 
              value={`${stats.approvalRate}%`} 
              subtitle="of processed cases"
              trend="+5% vs last month"
              trendUp={true}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard 
              title="Denial Rate" 
              value={`${stats.denialRate}%`} 
              subtitle="of processed cases"
              trend="-2% vs last month"
              trendUp={true}
              icon={XCircle}
              color="red"
            />
            <StatCard 
              title="Avg Processing" 
              value={stats.avgProcessingTime} 
              subtitle="claim to submission"
              trend="0.3 days faster"
              trendUp={true}
              icon={Clock}
              color="purple"
            />
          </div>

          {/* Status Distribution + Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                  Case Status Distribution
                </h3>
                <span className="text-[10px] text-slate-400">{stats.totalCases} total</span>
              </div>
              <div className="space-y-3">
                <StatusBar label="New" count={stats.byStatus.new || 0} total={stats.totalCases} color="bg-blue-500" />
                <StatusBar label="In Progress" count={stats.byStatus.in_progress || 0} total={stats.totalCases} color="bg-amber-500" />
                <StatusBar label="Needs Physician" count={stats.byStatus.needs_physician || 0} total={stats.totalCases} color="bg-purple-500" />
                <StatusBar label="Ready" count={stats.byStatus.ready || 0} total={stats.totalCases} color="bg-emerald-500" />
                <StatusBar label="Submitted" count={stats.byStatus.submitted || 0} total={stats.totalCases} color="bg-sky-500" />
                <StatusBar label="Approved" count={stats.byStatus.approved || 0} total={stats.totalCases} color="bg-green-500" />
                <StatusBar label="Denied" count={stats.byStatus.denied || 0} total={stats.totalCases} color="bg-red-500" />
              </div>
            </div>

            {/* Cases by Insurance */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  Cases by Insurance
                </h3>
              </div>
              <div className="space-y-3">
                {casesByInsurance.map(([insurance, count]) => (
                  <StatusBar 
                    key={insurance} 
                    label={insurance.length > 15 ? insurance.slice(0, 15) + "..." : insurance} 
                    count={count} 
                    total={stats.totalCases} 
                    color="bg-blue-500" 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Coaching Notes - Constructive Feedback */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Team Wins & Coaching Notes
              </h3>
              <span className="text-[10px] text-slate-500">This week</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Positive Feedback */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase mb-2">What's Working Well</p>
                <ul className="space-y-2">
                  <li className="text-[11px] text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Documentation completeness improved 12% this week
                  </li>
                  <li className="text-[11px] text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Average MD review time down to 1.8 minutes
                  </li>
                  <li className="text-[11px] text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Zero missed deadlines for STAT cases
                  </li>
                </ul>
              </div>
              {/* Improvement Opportunities */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-semibold text-blue-700 uppercase mb-2">Improvement Opportunities</p>
                <ul className="space-y-2">
                  <li className="text-[11px] text-blue-800 flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>Cardiology consults taking 2+ days - consider earlier requests</span>
                  </li>
                  <li className="text-[11px] text-blue-800 flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>Aetna denials up 5% - review updated criteria for cardiac cases</span>
                  </li>
                  <li className="text-[11px] text-blue-800 flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>Step-down documentation often missing - add to checklist?</span>
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
              Coaching notes are generated from patterns across all cases, not individual performance. The goal is shared learning to reduce everyone's workload.
            </p>
          </div>

          {/* Alerts + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Alerts - Reframed */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Action Items
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                  {stats.pendingPhysician} pending
                </span>
              </div>
              <div className="space-y-2">
                {stats.pendingPhysician > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-[11px] text-slate-700">Cases awaiting physician review</span>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-700">{stats.pendingPhysician}</span>
                  </div>
                )}
                {stats.readyForSubmission > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-slate-700">Cases ready for submission</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700">{stats.readyForSubmission}</span>
                  </div>
                )}
                {(stats.byStatus.denied || 0) > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-[11px] text-slate-700">Denied cases requiring appeal</span>
                    </div>
                    <span className="text-[11px] font-semibold text-red-700">{stats.byStatus.denied || 0}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  Recent Activity
                </h3>
                <Link href="/" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {recentActivity.slice(0, 6).map((activity, idx) => {
                  const fromConfig = statusConfig[activity.from]
                  const toConfig = statusConfig[activity.to]
                  return (
                    <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-700 truncate">{activity.patientName}</p>
                        <p className="text-[9px] text-slate-400">
                          {fromConfig.label} → {toConfig.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500">{activity.changedBy}</p>
                        <p className="text-[9px] text-slate-400">
                          {new Date(activity.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {recentActivity.length === 0 && (
                  <p className="text-[11px] text-slate-400 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center py-4">
            <p className="text-[10px] text-slate-400">
              Data refreshes automatically. Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
