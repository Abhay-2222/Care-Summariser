"use client"

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Circle } from "lucide-react"

type Step = "queue" | "open" | "claim" | "draft" | "hold"

const steps: Step[] = ["queue", "open", "claim", "draft", "hold"]

const captions: Record<Step, string> = {
  queue: "Chooses a case",
  open: "Opens the case",
  claim: "Claims the case",
  draft: "Drafts the request",
  hold: "Send stays off",
}

const queueRows = [
  { name: "Victor Expiredauth", status: "Denied", tone: "text-[var(--status-error-text)]" },
  { name: "Diana Statuschange", status: "With physician", tone: "text-[var(--status-warn-text)]" },
  { name: "Martha Complexity", status: "Denied", tone: "text-[var(--status-error-text)]" },
  { name: "Frank Deniedtwice", status: "Escalated", tone: "text-[var(--status-error-text)]" },
]

const requirements = [
  { name: "Cardiology consultation within 24 hours", state: "missing" as const },
  { name: "Discharge planning initiated", state: "unclear" as const },
  { name: "Documented medical necessity", state: "met" as const, evidence: "ED notes, vital signs" },
  { name: "Failed outpatient management", state: "met" as const, evidence: "Clinical history" },
  { name: "BNP/Troponin levels", state: "met" as const, evidence: "Lab results" },
]

function Mark() {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand-500)] shadow-ds-xs">
      <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    </div>
  )
}

function Identity() {
  return (
    <>
      <h2 className="flex items-baseline gap-2">
        <span className="text-title text-[var(--neutral-900)]">Sarah Johnson</span>
        <span className="text-meta text-[var(--neutral-500)]">67 F</span>
        <span className="text-meta text-[var(--status-error-text)]">STAT</span>
      </h2>
      <p className="mt-2 text-body text-[var(--neutral-900)]">Acute Decompensated Heart Failure</p>
      <p className="mt-1 text-meta text-[var(--neutral-500)]">MRN-892451 · Medicare Advantage · Admitted Jan 5, 2026</p>
    </>
  )
}

function RequirementRows() {
  return (
    <div className="space-y-2">
      <p className="text-meta text-[var(--neutral-900)]">Requirements</p>
      {requirements.map((rule) => (
        <div
          key={rule.name}
          className={`flex items-start gap-2 rounded-md border px-2.5 py-2 ${
            rule.state === "missing"
              ? "border-[var(--status-error-text)]"
              : rule.state === "unclear"
                ? "border-[var(--status-warn-text)]"
                : "border-border"
          }`}
        >
          {rule.state === "met" ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--status-ok-text)]" aria-hidden="true" />
          ) : rule.state === "missing" ? (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--status-error-text)]" aria-hidden="true" />
          ) : (
            <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--status-warn-text)]" aria-hidden="true" />
          )}
          <div>
            <p className="text-body text-[var(--neutral-900)]">{rule.name}</p>
            {rule.evidence && <p className="mt-0.5 text-meta text-[var(--neutral-500)]">{rule.evidence}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBlock({ claimed }: { claimed: boolean }) {
  return (
    <div>
      <p className="text-meta text-[var(--neutral-500)]">Status</p>
      <p className="mt-1 text-body text-[var(--neutral-900)]">
        {claimed ? "In progress" : "New"} · 3 of 5 requirements met
      </p>
    </div>
  )
}

function buttonPress(base: string, pressed: string): Keyframe[] {
  return [
    { transform: "translateY(0px) scale(1)", backgroundColor: base, boxShadow: "0 1px 0 rgb(0 0 0 / 0.18)" },
    { transform: "translateY(2px) scale(0.94)", backgroundColor: pressed, boxShadow: "inset 0 3px 5px rgb(0 0 0 / 0.4)", offset: 0.18 },
    { transform: "translateY(2px) scale(0.94)", backgroundColor: pressed, boxShadow: "inset 0 3px 5px rgb(0 0 0 / 0.4)", offset: 0.7 },
    { transform: "translateY(0px) scale(1)", backgroundColor: base, boxShadow: "0 1px 0 rgb(0 0 0 / 0.18)" },
  ]
}

function denyPress(): Keyframe[] {
  return [
    { transform: "translateX(0)" },
    { transform: "translateX(-4px)", offset: 0.2 },
    { transform: "translateX(4px)", offset: 0.4 },
    { transform: "translateX(-3px)", offset: 0.6 },
    { transform: "translateX(3px)", offset: 0.8 },
    { transform: "translateX(0)" },
  ]
}

function rowPress(base: string): Keyframe[] {
  return [
    { transform: "scale(1)", backgroundColor: base, boxShadow: "inset 0 0 0 0 #2d6a9f" },
    { transform: "scale(0.98)", backgroundColor: "#9ecef1", boxShadow: "inset 0 0 0 2px #2d6a9f", offset: 0.18 },
    { transform: "scale(0.98)", backgroundColor: "#9ecef1", boxShadow: "inset 0 0 0 2px #2d6a9f", offset: 0.7 },
    { transform: "scale(1)", backgroundColor: base, boxShadow: "inset 0 0 0 0 #2d6a9f" },
  ]
}

export function LandingDemo() {
  const stageRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>("queue")
  const [paused, setPaused] = useState(false)
  const [cursor, setCursor] = useState({ x: 24, y: 28, ready: false })
  const reduced = useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)")
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
  const shown: Step = reduced ? "open" : step

  useEffect(() => {
    if (reduced || paused) return
    const id = window.setInterval(() => {
      setStep((current) => steps[(steps.indexOf(current) + 1) % steps.length])
    }, 2400)
    return () => window.clearInterval(id)
  }, [reduced, paused])

  const target = shown === "queue" || shown === "open" ? "sarah" : shown === "claim" ? "claim" : shown === "draft" ? "draft" : "send"

  useLayoutEffect(() => {
    const stage = stageRef.current
    const node = stage?.querySelector<HTMLElement>(`[data-demo="${target}"][data-live="true"]`)
    if (!stage || !node) return
    const place = () => {
      const outer = stage.getBoundingClientRect()
      const box = node.getBoundingClientRect()
      const onButton = target === "claim" || target === "draft" || target === "send"
      setCursor({
        x: onButton ? box.right - outer.left - 2 : box.left - outer.left + 8,
        y: box.top - outer.top + 6,
        ready: true,
      })
    }
    place()

    let cursorAnim: Animation | undefined
    let press: Animation | undefined
    const frame = window.requestAnimationFrame(() => {
      if (reduced || shown === "open") return
      const onButton = target === "claim" || target === "draft" || target === "send"
      node.style.transformOrigin = onButton ? "right center" : "left center"
      const timing: KeyframeAnimationOptions = { duration: 820, delay: 440, easing: "ease" }
      const base = getComputedStyle(node).backgroundColor
      const frames = target === "send" ? denyPress() : onButton ? buttonPress(base, "#14324f") : rowPress(base)
      press = node.animate(frames, timing)
      cursorAnim = cursorRef.current?.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(0.72)", offset: 0.18 },
          { transform: "scale(0.72)", offset: 0.7 },
          { transform: "scale(1)" },
        ],
        timing,
      )
    })

    window.addEventListener("resize", place)
    return () => {
      window.cancelAnimationFrame(frame)
      press?.cancel()
      cursorAnim?.cancel()
      window.removeEventListener("resize", place)
    }
  }, [target, shown, reduced])

  const caseOpen = shown !== "queue"
  const claimed = shown === "claim" || shown === "draft" || shown === "hold"
  const drafting = shown === "draft" || shown === "hold"

  return (
    <div
      className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-ds-xs lg:col-span-4 lg:row-span-3 lg:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-meta text-[var(--neutral-500)]" aria-live="polite">
            {captions[shown]}
          </p>
          <div className="flex items-center gap-1" aria-hidden="true">
            {steps.map((item) => (
              <span
                key={item}
                className={
                  item === shown
                    ? "h-1.5 w-3 rounded-full bg-[var(--brand-500)]"
                    : "h-1.5 w-1.5 rounded-full bg-[var(--neutral-300)]"
                }
              />
            ))}
          </div>
        </div>
        <Link href="/patient/1" className="focus-ring shrink-0 text-meta text-[var(--brand-600)]">
          Open this case
        </Link>
      </div>
      <div
        ref={stageRef}
        className="relative mt-4 flex flex-col overflow-hidden rounded-lg border border-border bg-background sm:flex-row"
      >
        <div className="border-b border-border bg-card sm:w-52 sm:shrink-0 sm:border-r sm:border-b-0">
          <div className="flex h-10 items-center gap-2 border-b border-border px-3">
            <Mark />
            <span className="text-meta text-[var(--neutral-900)]">Queue</span>
          </div>
          <ul>
            {queueRows.slice(0, 3).map((row) => (
              <li key={row.name} className="border-l-2 border-l-transparent px-3 py-1.5">
                <p className="truncate text-body text-[var(--neutral-800)]">{row.name}</p>
                <p className={`text-meta ${row.tone}`}>{row.status}</p>
              </li>
            ))}
            <li
              data-demo="sarah"
              data-live="true"
              className={
                caseOpen
                  ? "border-l-2 border-l-[var(--brand-500)] bg-[var(--brand-50)] px-3 py-1.5"
                  : "border-l-2 border-l-transparent px-3 py-1.5"
              }
            >
              <p className="truncate text-body text-[var(--neutral-800)]">Sarah Johnson</p>
              <p className={`text-meta ${claimed ? "text-[var(--neutral-800)]" : "text-[var(--status-info-text)]"}`}>
                {claimed ? "In progress" : "New"}
              </p>
            </li>
            <li className="border-l-2 border-l-transparent px-3 py-1.5">
              <p className="truncate text-body text-[var(--neutral-800)]">{queueRows[3].name}</p>
              <p className={`text-meta ${queueRows[3].tone}`}>{queueRows[3].status}</p>
            </li>
          </ul>
        </div>
        <div className="relative min-w-0 flex-1 bg-card">
          <div className={`flex flex-col p-4 ${shown === "queue" ? "invisible" : ""}`} aria-hidden={shown === "queue" || undefined} {...(shown === "queue" ? { inert: true } : {})}>
            <Identity />
            <div className="mt-4 border-t border-border pt-4">
              <StatusBlock claimed={claimed} />
              <div className="mt-4">
                <RequirementRows />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  data-demo="claim"
                  data-live={shown === "claim" ? "true" : undefined}
                  className={`inline-flex h-8 min-w-[7.5rem] items-center justify-center whitespace-nowrap rounded-md px-3 text-body text-white ${
                    claimed ? "bg-[var(--brand-600)]" : "bg-[var(--primary)]"
                  }`}
                >
                  {claimed ? "Claimed" : "Claim"}
                </div>
                <div
                  data-demo="draft"
                  data-live={shown === "draft" ? "true" : undefined}
                  className={`inline-flex h-8 min-w-[8.5rem] items-center justify-center whitespace-nowrap rounded-md px-3 text-body ${
                    drafting
                      ? "bg-[var(--brand-600)] text-white"
                      : "border border-border bg-[var(--neutral-100)] text-[var(--neutral-600)]"
                  }`}
                >
                  {drafting ? "Drafted" : "Draft request"}
                </div>
              </div>
              <div
                data-demo="send"
                data-live={shown === "hold" ? "true" : undefined}
                className="mt-2 inline-flex h-8 items-center whitespace-nowrap rounded-md border border-border bg-[var(--neutral-100)] px-3 text-body text-[var(--neutral-600)]"
              >
                Send to Medicare Advantage
              </div>
              <p className="mt-2 h-4 whitespace-nowrap text-meta">
                {drafting ? (
                  <span className="text-[var(--neutral-900)]">DRAFT, NOT SENT · 2 requirements still open</span>
                ) : claimed ? (
                  <span className="text-[var(--neutral-500)]">Maria Santos · 2 requirements still open</span>
                ) : (
                  <span className="text-[var(--status-error-text)]">2 requirements still open</span>
                )}
              </p>
            </div>
          </div>
          {shown === "queue" && (
            <p className="absolute inset-0 flex items-center justify-center text-body text-[var(--neutral-500)]">Pick a case from the queue.</p>
          )}
        </div>
        {!reduced && cursor.ready && (
          <div
            ref={cursorRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-20"
            style={{
              left: cursor.x,
              top: cursor.y,
              transformOrigin: "0 0",
              transition: "left 420ms ease, top 420ms ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 1.5 L3 13 L6.2 9.6 L9.4 14 L11 13.2 L7.8 8.8 L12.2 8.2 Z" fill="#18181b" stroke="white" strokeWidth="1" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
