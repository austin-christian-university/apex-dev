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
  title: "Blueprint",
  description: "A comprehensive platform for tracking student development and growth through leadership, community service, and academic achievement",
  keywords: ["student leadership", "development", "education", "community service", "academic achievement"],
  authors: [{ name: "ACE Development Team" }],
  creator: "ACE Development Team",
  publisher: "ACE Development Team",
  generator: 'Next.js',
  applicationName: "ACE Blueprint",
  referrer: "origin-when-cross-origin",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFAF0" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0D11" }
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.ico',
        color: '#0A0D11',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ace-blueprint.com',
    siteName: 'ACE Blueprint',
    title: 'ACE Blueprint - Student Leadership Development Platform',
    description: 'A comprehensive platform for tracking student development and growth through leadership, community service, and academic achievement',
    images: [
      {
        url: '/ace_club_solid_bg.png',
        width: 1200,
        height: 630,
        alt: 'ACE Blueprint - Student Leadership Development Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACE Blueprint - Student Leadership Development Platform',
    description: 'A comprehensive platform for tracking student development and growth through leadership, community service, and academic achievement',
    images: ['/ace_club_solid_bg.png'],
    creator: '@ace_blueprint',
    site: '@ace_blueprint',
  },
  other: {
    'msapplication-TileColor': '#0A0D11',
    'msapplication-config': '/browserconfig.xml',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'ACE Blueprint',
    'mobile-web-app-capable': 'yes',
    'theme-color': '#0A0D11',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn("min-h-screen bg-background font-primary antialiased", roboto.variable, robotoMono.variable)}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 