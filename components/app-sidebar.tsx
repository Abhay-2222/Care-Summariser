"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, BarChart3, Plug, Shield, GraduationCap, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { icon: Users, label: "Patient List", href: "/" },
  { icon: BarChart3, label: "Ops Dashboard", href: "/dashboard" },
  { icon: Plug, label: "Integration Management", href: "/integrations" },
  { icon: Shield, label: "Quality & Compliance", href: "/compliance" },
  { icon: GraduationCap, label: "Training & Support", href: "/training" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
      <nav className="flex h-full flex-col gap-1 p-3">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href === "/" && pathname.startsWith("/patient"))

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "h-10 justify-start gap-3 px-3 font-normal",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-sm">{item.label}</span>
              </Link>
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
