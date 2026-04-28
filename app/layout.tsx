import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono, Fraunces } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AppProvider } from "@/lib/app-context"
import { Toaster } from "@/components/ui/toaster"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
})
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
})

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
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
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
