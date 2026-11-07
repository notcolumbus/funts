import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Funts",
  description: "The super fast font finder.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>
}
