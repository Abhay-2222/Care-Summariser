import { describe, expect, it } from "vitest"
import type { Patient } from "./types"
import { compareByDeadline, isDueToday, rulesMet } from "./workflow-utils"

function row(partial: Partial<Patient>): Patient {
  return partial as Patient
}

describe("rulesMet", () => {
  it("counts satisfied payer rules", () => {
    const patient = row({
      payerRules: [
        { id: "1", rule: "Echo", status: "satisfied" },
        { id: "2", rule: "BNP", status: "missing" },
        { id: "3", rule: "Note", status: "satisfied" },
      ],
    })
    expect(rulesMet(patient)).toBe(2)
  })
})

describe("isDueToday", () => {
  it("is true when the deadline is inside 24 hours or overdue", () => {
    expect(isDueToday(row({ paDeadline: { type: "initial", deadline: "", hoursRemaining: 6, isWeekend: false, payerSLA: "", status: "at_risk" } }))).toBe(true)
    expect(isDueToday(row({ paDeadline: { type: "initial", deadline: "", hoursRemaining: -4, isWeekend: false, payerSLA: "", status: "overdue" } }))).toBe(true)
    expect(isDueToday(row({ paDeadline: { type: "initial", deadline: "", hoursRemaining: 48, isWeekend: false, payerSLA: "", status: "on_track" } }))).toBe(false)
    expect(isDueToday(row({}))).toBe(false)
  })
})

describe("compareByDeadline", () => {
  it("sorts overdue first, then hours remaining, then urgency", () => {
    const deadline = { type: "initial" as const, deadline: "", isWeekend: false, payerSLA: "" }
    const overdueRoutine = row({ urgency: "ROUTINE", paDeadline: { ...deadline, hoursRemaining: -48, status: "overdue" } })
    const onTimeStat = row({ urgency: "STAT", paDeadline: { ...deadline, hoursRemaining: 4, status: "on_track" } })
    const sooner = row({ urgency: "ROUTINE", paDeadline: { ...deadline, hoursRemaining: 2, status: "at_risk" } })
    const laterUrgent = row({ urgency: "URGENT", paDeadline: { ...deadline, hoursRemaining: 10, status: "on_track" } })
    const sorted = [onTimeStat, laterUrgent, overdueRoutine, sooner].sort(compareByDeadline)
    expect(sorted).toEqual([overdueRoutine, sooner, onTimeStat, laterUrgent])
  })
})
