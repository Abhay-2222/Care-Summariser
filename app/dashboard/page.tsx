"use client"

import { AppHeader } from "@/components/app-header"
import { BarChart3, TrendingUp, Clock, CheckCircle2, Users, Activity } from "lucide-react"
import { PageHeader, Scorecard, Section, ActivityItem, Gauge } from "@/components/redwood"

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      
      {/* Page Header - Human-centered framing */}
      <PageHeader 
        title="Your Impact Today"
        description="Every case processed is a patient closer to the care they need"
      />

      <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
        <div className="mx-auto max-w-6xl space-y-6">
          
          {/* Scoreboard Cards - Patient-impact framing */}
          <div className="grid gap-4 md:grid-cols-4">
            <Scorecard 
              title="Patients in Queue"
              value={127}
              icon={<Users className="h-3.5 w-3.5 text-primary" />}
              trend={{ value: "127 patients awaiting care authorization", direction: "up" }}
            />
            <Scorecard 
              title="Patients Helped Today"
              value={43}
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />}
              trend={{ value: "8 more ready for your review", direction: "neutral" }}
            />
            <Scorecard 
              title="Time Saved per Case"
              value="2.4"
              unit="h"
              icon={<Clock className="h-3.5 w-3.5 text-[var(--warning)]" />}
              trend={{ value: "vs manual process - that's more time for patients", direction: "up" }}
            />
            <Scorecard 
              title="Authorization Success"
              value="89.2"
              unit="%"
              icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--success)]" />}
              trend={{ value: "Your facility outperforms 82% industry avg", direction: "neutral" }}
              variant="success"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Data Visualization Section - Redwood Pattern */}
            <Section 
              title="Cases by Priority" 
              icon={<BarChart3 className="h-4 w-4 text-foreground" />}
            >
              <div className="space-y-4">
                <Gauge label="STAT" value={15} max={127} status="error" />
                <Gauge label="URGENT" value={42} max={127} status="warning" />
                <Gauge label="ROUTINE" value={70} max={127} status="neutral" />
              </div>
            </Section>

            {/* Activity List - Patient-focused outcomes */}
            <Section 
              title="Patients Moving Forward" 
              icon={<Activity className="h-4 w-4 text-primary" />}
            >
              <div className="space-y-2">
                <ActivityItem 
                  title="Sarah Johnson can now get her MRI"
                  description="Authorization approved - imaging scheduled"
                  timestamp="5m ago"
                  status="success"
                />
                <ActivityItem 
                  title="John Davis needs your help"
                  description="Cardiac procedure awaiting clinical review"
                  timestamp="12m ago"
                  status="warning"
                />
                <ActivityItem 
                  title="Maria Garcia starting PT today"
                  description="8-week program authorized"
                  timestamp="28m ago"
                  status="success"
                />
              </div>
            </Section>
          </div>
        </div>
      </main>
    </div>
  )
}
