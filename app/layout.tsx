import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AppProvider } from "@/lib/app-context"
import { Toaster } from "@/components/ui/toaster"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _instrumentSerif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CareSummarizer AI - Healthcare Prior Authorization Platform",
  description: "Enterprise healthcare AI platform for utilization review and prior authorization",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AppProvider>
          {children}
          <Toaster />
          <KeyboardShortcutsDialog />
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
}
