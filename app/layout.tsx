import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Todo App | Organize Your Tasks",
  description: "A beautiful and intuitive todo application to help you stay organized",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
