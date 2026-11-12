import Link from "next/link"
import { LandingDemo } from "@/components/landing-demo"

function Mark({ size = "md" }: { size?: "md" | "sm" }) {
  const box = size === "sm" ? "h-6 w-6 rounded-md" : "h-8 w-8 rounded-lg"
  const icon = size === "sm" ? "h-3 w-3" : "h-4 w-4"
  return (
    <div className={`flex items-center justify-center bg-[var(--brand-500)] shadow-ds-xs ${box}`}>
      <svg className={`${icon} text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    </div>
  )
}

const jobs = [
  {
    title: "Queue",
    body: "What is due today, what is yours, and what is waiting on someone else.",
  },
  {
    title: "Case",
    body: "The name, the requirements, and what is still missing, on one record.",
  },
  {
    title: "Request",
    body: "A draft built from the case. CareLens quotes the chart and does not send it.",
  },
]

const roles = [
  {
    title: "Case manager",
    name: "Maria Santos",
    body: "Claims a case and sends it for sign-off.",
  },
  {
    title: "Physician",
    name: "Dr. Robert Kim",
    body: "Signs off, sends back, or escalates. Sign off stays off until the requirements are met.",
  },
  {
    title: "Auditor",
    name: "Jennifer Walsh",
    body: "Reads what changed on the case.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-2">
            <Mark />
            <span className="text-title text-[var(--neutral-900)]">CareSummarizer</span>
          </div>
          <Link
            href="/queue"
            className="focus-ring inline-flex h-8 items-center rounded-lg bg-[var(--primary)] px-3 text-body text-white hover:bg-[var(--brand-600)]"
          >
            Open the queue
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-4 pb-16 lg:px-10">
        <p className="text-meta text-[var(--neutral-500)]">Prior authorization</p>
        <div className="mt-3 flex max-w-2xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="max-w-xl text-[22px] font-semibold leading-snug text-[var(--neutral-900)]">
            Review the case before the request is drafted.
          </h1>
        </div>
        <p className="mt-4 max-w-xl text-body text-[var(--neutral-700)]">
          A case manager, a physician, and an auditor share one record. The queue shows what is due. The case shows what is missing. The draft is built from that record.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-6 lg:gap-8">
          <LandingDemo />

          {jobs.map((job) => (
            <article key={job.title} className="rounded-xl border border-border bg-card p-6 shadow-ds-xs lg:col-span-2">
              <h2 className="text-title text-[var(--neutral-900)]">{job.title}</h2>
              <p className="mt-3 text-body text-[var(--neutral-700)]">{job.body}</p>
            </article>
          ))}

          {roles.map((role) => (
            <article key={role.title} className="rounded-xl border border-border bg-card p-6 shadow-ds-xs lg:col-span-2">
              <h2 className="text-title text-[var(--neutral-900)]">{role.title}</h2>
              <p className="mt-1 text-meta text-[var(--neutral-500)]">{role.name}</p>
              <p className="mt-3 text-body text-[var(--neutral-700)]">{role.body}</p>
            </article>
          ))}
        </div>

        <p className="mt-16 text-meta text-[var(--neutral-500)]">
          A prototype. Every case stays in the browser. Nothing is sent to a payer.
        </p>
      </main>
    </div>
  )
}
