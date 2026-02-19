"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  MessageSquare,
  Send,
  AtSign,
  UserPlus,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  History,
  Pin,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  FileText,
  Tag,
  Users,
  Bell,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface CaseNote {
  id: string
  author: {
    name: string
    role: string
    initials: string
    color: string
  }
  content: string
  timestamp: string
  type: "note" | "mention" | "system" | "handoff"
  mentions?: string[]
  pinned?: boolean
  category?: "clinical" | "administrative" | "pa" | "urgent"
  replyTo?: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
  color: string
  status: "online" | "busy" | "away" | "offline"
}

// Mock data
const mockNotes: CaseNote[] = [
  {
    id: "note-1",
    author: { name: "Dr. Robert Chen", role: "Attending Physician", initials: "RC", color: "bg-purple-500" },
    content: "Patient stable overnight. Continue current diuretic regimen. Ready for PA submission pending cardiology consult documentation.",
    timestamp: "Today at 8:30 AM",
    type: "note",
    pinned: true,
    category: "clinical",
  },
  {
    id: "note-2",
    author: { name: "Sarah Williams", role: "Case Manager", initials: "SW", color: "bg-blue-500" },
    content: "@Dr. Chen - Cardiology note received. PA now 95% complete. Should we submit today?",
    timestamp: "Today at 9:15 AM",
    type: "mention",
    mentions: ["Dr. Chen"],
    category: "pa",
  },
  {
    id: "note-3",
    author: { name: "Dr. Robert Chen", role: "Attending Physician", initials: "RC", color: "bg-purple-500" },
    content: "Yes, please proceed with PA submission. I've reviewed and approved the clinical justification.",
    timestamp: "Today at 9:22 AM",
    type: "note",
    replyTo: "note-2",
    category: "pa",
  },
  {
    id: "note-4",
    author: { name: "System", role: "Automated", initials: "SY", color: "bg-slate-400" },
    content: "Case status changed from 'In Progress' to 'Ready for PA'",
    timestamp: "Today at 9:25 AM",
    type: "system",
  },
  {
    id: "note-5",
    author: { name: "Jennifer Martinez", role: "Social Worker", initials: "JM", color: "bg-emerald-500" },
    content: "Discharge planning note: Patient will need home health PT. Family meeting scheduled for tomorrow to discuss care plan.",
    timestamp: "Yesterday at 4:15 PM",
    type: "note",
    category: "administrative",
  },
]

const teamMembers: TeamMember[] = [
  { id: "tm-1", name: "Dr. Robert Chen", role: "Attending Physician", initials: "RC", color: "bg-purple-500", status: "online" },
  { id: "tm-2", name: "Sarah Williams", role: "Case Manager", initials: "SW", color: "bg-blue-500", status: "online" },
  { id: "tm-3", name: "Jennifer Martinez", role: "Social Worker", initials: "JM", color: "bg-emerald-500", status: "busy" },
  { id: "tm-4", name: "Dr. Lisa Park", role: "Cardiologist", initials: "LP", color: "bg-amber-500", status: "away" },
  { id: "tm-5", name: "Michael Torres", role: "Physical Therapist", initials: "MT", color: "bg-red-500", status: "offline" },
]

const statusColors = {
  online: "bg-[var(--success)]",
  busy: "bg-[var(--destructive)]",
  away: "bg-[var(--warning)]",
  offline: "bg-[var(--neutral-300)]",
}

const categoryConfig = {
  clinical: { label: "Clinical", color: "bg-[var(--status-ok-bg)] text-[var(--status-ok-text)] border-[var(--status-ok-border)]" },
  administrative: { label: "Admin", color: "bg-[var(--neutral-100)] text-[var(--neutral-700)] border-[var(--neutral-200)]" },
  pa: { label: "PA", color: "bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info-border)]" },
  urgent: { label: "Urgent", color: "bg-[var(--status-error-bg)] text-[var(--status-error-text)] border-[var(--status-error-border)]" },
}

interface CollaborationPanelProps {
  patientId: string
  patientName: string
}

export function CollaborationPanel({ patientId, patientName }: CollaborationPanelProps) {
  const [notes, setNotes] = useState<CaseNote[]>(mockNotes)
  const [newNote, setNewNote] = useState("")
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [handoffDialogOpen, setHandoffDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("notes")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "@") {
      setShowMentions(true)
      setMentionSearch("")
    }
  }

  const handleMention = (member: TeamMember) => {
    setNewNote((prev) => `${prev}@${member.name} `)
    setShowMentions(false)
    textareaRef.current?.focus()
  }

  const handleSendNote = () => {
    if (!newNote.trim()) return

    const mentions = newNote.match(/@[\w\s.]+/g)?.map((m) => m.slice(1)) || []
    const newCaseNote: CaseNote = {
      id: `note-${Date.now()}`,
      author: { name: "Current User", role: "Case Manager", initials: "CU", color: "bg-blue-500" },
      content: newNote,
      timestamp: "Just now",
      type: mentions.length > 0 ? "mention" : "note",
      mentions,
      category: selectedCategory as CaseNote["category"] || undefined,
    }

    setNotes((prev) => [newCaseNote, ...prev])
    setNewNote("")
    setSelectedCategory("")
  }

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start gap-1 p-1 bg-[var(--neutral-100)] rounded-lg mx-3 mt-3" style={{ width: "calc(100% - 24px)" }}>
          <TabsTrigger value="notes" className="text-caption h-7 px-3 data-[state=active]:bg-card flex-1">
            <MessageSquare className="h-3 w-3 mr-1" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="team" className="text-caption h-7 px-3 data-[state=active]:bg-card flex-1">
            <Users className="h-3 w-3 mr-1" />
            Team
          </TabsTrigger>
          <TabsTrigger value="history" className="text-caption h-7 px-3 data-[state=active]:bg-card flex-1">
            <History className="h-3 w-3 mr-1" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 flex flex-col m-0 p-3 pt-0">
          <ScrollArea className="flex-1 -mx-3 px-3" ref={scrollRef}>
            <div className="space-y-3 py-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    note.pinned && "border-[var(--status-warn-border)] bg-[var(--status-warn-bg)]",
                    note.type === "system" && "bg-[var(--neutral-50)] border-[var(--neutral-200)]",
                    !note.pinned && note.type !== "system" && "bg-card border-border"
                  )}
                >
                  {note.type === "system" ? (
                    <div className="flex items-center gap-2 text-body-sm text-[var(--neutral-500)]">
                      <Clock className="h-3 w-3" />
                      <span>{note.content}</span>
                      <span className="text-[var(--neutral-400)] ml-auto">{note.timestamp}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className={cn("text-[9px] text-white", note.author.color)}>
                              {note.author.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-label-md text-foreground">{note.author.name}</span>
                              {note.pinned && <Pin className="h-3 w-3 text-[var(--warning)]" />}
                            </div>
                            <span className="text-caption text-[var(--neutral-400)]">{note.author.role}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {note.category && (
                            <Badge variant="outline" className={cn("text-ds-badge h-4", categoryConfig[note.category].color)}>
                              {categoryConfig[note.category].label}
                            </Badge>
                          )}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-32 p-1">
                              <Button variant="ghost" size="sm" className="w-full justify-start text-body-sm h-7">
                                <Reply className="h-3 w-3 mr-2" />
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="w-full justify-start text-body-sm h-7">
                                <Pin className="h-3 w-3 mr-2" />
                                Pin
                              </Button>
                              <Button variant="ghost" size="sm" className="w-full justify-start text-body-sm h-7 text-[var(--destructive)]">
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </Button>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <p className="text-body-sm text-foreground mt-2">
                        {note.content.split(/(@[\w\s.]+)/).map((part, i) =>
                          part.startsWith("@") ? (
                            <span key={i} className="text-[var(--brand-500)]">{part}</span>
                          ) : (
                            part
                          )
                        )}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-caption text-[var(--neutral-400)]">{note.timestamp}</span>
                        {note.mentions && note.mentions.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AtSign className="h-3 w-3 text-[var(--neutral-400)]" />
                            <span className="text-caption text-[var(--neutral-400)]">{note.mentions.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Compose Note */}
          <div className="border-t pt-3 -mx-3 px-3 bg-card">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Add a note... Use @ to mention team members"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] text-xs pr-20 resize-none"
                rows={2}
              />
              {showMentions && (
                <div className="absolute bottom-full left-0 mb-1 w-64 bg-card rounded-xl border shadow-ds-lg p-1 max-h-48 overflow-auto z-50">
                  <div className="px-2 py-1 text-overline text-[var(--neutral-500)]">Mention someone</div>
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMention(member)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-[var(--neutral-100)] rounded"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className={cn("text-[8px] text-white", member.color)}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-label-md">{member.name}</p>
                        <p className="text-caption text-[var(--neutral-400)]">{member.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-7 w-24 text-caption">
                    <Tag className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Label" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-body-sm">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-caption bg-transparent"
                  onClick={() => setShowMentions(true)}
                >
                  <AtSign className="h-3 w-3 mr-1" />
                  Mention
                </Button>
              </div>
              <Button size="sm" className="h-7 text-caption" onClick={handleSendNote} disabled={!newNote.trim()}>
                <Send className="h-3 w-3 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="flex-1 flex flex-col m-0 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label-md text-foreground">Care Team</span>
            <Button variant="outline" size="sm" className="h-6 text-caption bg-transparent" onClick={() => setHandoffDialogOpen(true)}>
              <ArrowRight className="h-3 w-3 mr-1" />
              Handoff
            </Button>
          </div>
          <ScrollArea className="flex-1 -mx-3 px-3">
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-2 bg-card rounded-xl border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={cn("text-[10px] text-white", member.color)}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                        statusColors[member.status]
                      )} />
                    </div>
                    <div>
                      <p className="text-label-md text-foreground">{member.name}</p>
                      <p className="text-caption text-[var(--neutral-400)]">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Bell className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 flex flex-col m-0 p-3">
          <ScrollArea className="flex-1 -mx-3 px-3">
            <div className="space-y-0">
              {[
                { action: "PA submitted to payer", user: "Sarah Williams", time: "Today, 9:30 AM", icon: Send },
                { action: "Case approved by physician", user: "Dr. Robert Chen", time: "Today, 9:22 AM", icon: CheckCircle },
                { action: "Cardiology note added", user: "Dr. Lisa Park", time: "Today, 8:45 AM", icon: FileText },
                { action: "Status changed to Ready", user: "System", time: "Today, 8:30 AM", icon: AlertTriangle },
                { action: "Case claimed", user: "Sarah Williams", time: "Yesterday, 2:15 PM", icon: UserPlus },
                { action: "Case created", user: "System", time: "Jan 20, 2026", icon: Clock },
              ].map((item, index) => (
                <div key={index} className="flex gap-3 py-2">
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-[var(--neutral-100)] flex items-center justify-center">
                      <item.icon className="h-3 w-3 text-[var(--neutral-500)]" />
                    </div>
                    {index < 5 && <div className="w-0.5 flex-1 bg-[var(--neutral-200)] my-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-label-md text-foreground">{item.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-caption text-[var(--neutral-500)]">{item.user}</span>
                      <span className="text-caption text-[var(--neutral-300)]">|</span>
                      <span className="text-caption text-[var(--neutral-400)]">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Handoff Dialog */}
      <Dialog open={handoffDialogOpen} onOpenChange={setHandoffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Case Handoff</DialogTitle>
            <DialogDescription>
              Transfer this case to another team member with context and notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-label-md text-foreground">Handoff To</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className={cn("text-[8px] text-white", member.color)}>
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm">{member.name}</span>
                          <span className="text-xs text-[var(--neutral-400)] ml-2">{member.role}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Handoff Reason</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shift">End of Shift</SelectItem>
                  <SelectItem value="expertise">Specialized Expertise Needed</SelectItem>
                  <SelectItem value="workload">Workload Balancing</SelectItem>
                  <SelectItem value="escalation">Escalation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Handoff Notes</label>
              <Textarea
                placeholder="Provide context about the current state of the case, pending items, and any urgent concerns..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <AlertTriangle className="h-4 w-4 text-[var(--warning)] flex-shrink-0" />
              <p className="text-xs text-amber-800">
                The recipient will be notified immediately and will have full access to case history and notes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandoffDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setHandoffDialogOpen(false)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Complete Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
