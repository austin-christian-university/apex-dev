import type { Metadata } from "next"
import { Roboto, Roboto_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@acu-apex/utils"
import { AuthProvider } from "@/components/auth/auth-provider"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
})

export const metadata: Metadata = {
  title: "ACU Apex - Student Development Platform",
  description: "A comprehensive platform for tracking student development and growth",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-primary antialiased", roboto.variable, robotoMono.variable)}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 