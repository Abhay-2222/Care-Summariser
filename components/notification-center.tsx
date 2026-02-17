"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  MessageSquare,
  Phone,
  Calendar,
  Settings,
  ChevronRight,
  X,
  Check,
  Filter,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationType = 
  | "pa_approved" 
  | "pa_denied" 
  | "pa_info_requested"
  | "deadline_warning"
  | "case_assigned"
  | "escalation"
  | "p2p_scheduled"
  | "message"
  | "case_update"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  urgent: boolean
  actionUrl?: string
  actionLabel?: string
  patientName?: string
  paNumber?: string
}

// Mock notifications - Human-centered, patient-impact language
const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "pa_approved",
    title: "Treatment Authorized",
    message: "James Wilson can now receive scheduled cardiac care - PA-2026-78401 approved by Aetna",
    timestamp: "5 min ago",
    read: false,
    urgent: false,
    patientName: "James Wilson",
    paNumber: "PA-2026-78401",
    actionUrl: "/prior-auth",
    actionLabel: "View Details",
  },
  {
    id: "n2",
    type: "deadline_warning",
    title: "Patient Waiting",
    message: "Sarah Johnson's treatment authorization due in 2 hours - submit now to avoid care delay",
    timestamp: "15 min ago",
    read: false,
    urgent: true,
    patientName: "Sarah Johnson",
    actionUrl: "/patient/1",
    actionLabel: "Review Case",
  },
  {
    id: "n3",
    type: "escalation",
    title: "Complex Case Support",
    message: "Maria Garcia's case needs Medical Director input for complex clinical decision",
    timestamp: "1 hour ago",
    read: false,
    urgent: true,
    patientName: "Maria Garcia",
    actionUrl: "/medical-director",
    actionLabel: "View Escalation",
  },
  {
    id: "n4",
    type: "p2p_scheduled",
    title: "Advocacy Call Scheduled",
    message: "P2P review for Robert Martinez tomorrow 2:00 PM - your chance to advocate for patient care",
    timestamp: "2 hours ago",
    read: true,
    urgent: false,
    patientName: "Robert Martinez",
    actionUrl: "/medical-director",
    actionLabel: "View Details",
  },
  {
    id: "n5",
    type: "message",
    title: "Team Collaboration",
    message: "Dr. Chen added clinical context to Sarah Johnson's case that may help approval",
    timestamp: "3 hours ago",
    read: true,
    urgent: false,
    patientName: "Sarah Johnson",
    actionUrl: "/patient/1",
    actionLabel: "View Note",
  },
  {
    id: "n6",
    type: "pa_info_requested",
    title: "Info Requested",
    message: "UnitedHealth requesting additional documentation for Maria Garcia",
    timestamp: "4 hours ago",
    read: true,
    urgent: true,
    patientName: "Maria Garcia",
    paNumber: "PA-2026-78356",
    actionUrl: "/prior-auth",
    actionLabel: "Respond",
  },
  {
    id: "n7",
    type: "case_assigned",
    title: "New Case Assigned",
    message: "You have been assigned to Robert Martinez's case",
    timestamp: "Yesterday",
    read: true,
    urgent: false,
    patientName: "Robert Martinez",
    actionUrl: "/patient/4",
    actionLabel: "View Case",
  },
  {
    id: "n8",
    type: "pa_denied",
    title: "PA Denied",
    message: "PA-2026-78290 for Robert Martinez was denied",
    timestamp: "2 days ago",
    read: true,
    urgent: false,
    patientName: "Robert Martinez",
    paNumber: "PA-2026-78290",
    actionUrl: "/appeals",
    actionLabel: "File Appeal",
  },
]

const notificationConfig: Record<NotificationType, { icon: typeof Bell; color: string; bgColor: string }> = {
  pa_approved: { icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  pa_denied: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  pa_info_requested: { icon: AlertTriangle, color: "text-amber-600", bgColor: "bg-amber-100" },
  deadline_warning: { icon: Clock, color: "text-red-600", bgColor: "bg-red-100" },
  case_assigned: { icon: Users, color: "text-blue-600", bgColor: "bg-blue-100" },
  escalation: { icon: AlertTriangle, color: "text-amber-600", bgColor: "bg-amber-100" },
  p2p_scheduled: { icon: Phone, color: "text-blue-600", bgColor: "bg-blue-100" },
  message: { icon: MessageSquare, color: "text-slate-600", bgColor: "bg-slate-100" },
  case_update: { icon: FileText, color: "text-slate-600", bgColor: "bg-slate-100" },
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length
  const urgentCount = notifications.filter((n) => n.urgent && !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !n.read
    if (activeTab === "urgent") return n.urgent
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 rounded-full text-[9px] flex items-center justify-center text-white",
              urgentCount > 0 ? "bg-red-500" : "bg-blue-500"
            )}>
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between p-3 border-b">
          <div>
            <h3 className="text-sm text-slate-900">Notifications</h3>
            <p className="text-[10px] text-slate-500">{unreadCount} unread</p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start gap-1 p-1 bg-slate-50 rounded-none border-b">
            <TabsTrigger value="all" className="text-[10px] h-6 px-2 data-[state=active]:bg-white">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-[10px] h-6 px-2 data-[state=active]:bg-white">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-[10px] h-6 px-2 data-[state=active]:bg-white">
              Urgent {urgentCount > 0 && `(${urgentCount})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="m-0">
            <ScrollArea className="h-[350px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-xs">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredNotifications.map((notification) => {
                    const config = notificationConfig[notification.type]
                    const Icon = config.icon
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 hover:bg-slate-50 transition-colors cursor-pointer relative group",
                          !notification.read && "bg-blue-50/50"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", config.bgColor)}>
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  "text-xs",
                                  !notification.read ? "text-slate-900" : "text-slate-600"
                                )}>
                                  {notification.title}
                                </p>
                                {notification.urgent && (
                                  <Badge variant="outline" className="text-[8px] h-4 px-1 bg-red-50 text-red-700 border-red-200">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  dismissNotification(notification.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded flex items-center justify-center hover:bg-slate-200"
                              >
                                <X className="h-3 w-3 text-slate-400" />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-slate-400">{notification.timestamp}</span>
                              {notification.actionUrl && (
                                <a
                                  href={notification.actionUrl}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
                                >
                                  {notification.actionLabel}
                                  <ChevronRight className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-2 border-t bg-slate-50 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-[10px] h-7 text-slate-500">
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
          <Button variant="ghost" size="sm" className="text-[10px] h-7 text-blue-600">
            View all notifications
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
