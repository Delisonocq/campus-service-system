import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/app/components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Campus Service Management System',
  description:
    'A centralised platform for managing campus services, staff, and student requests.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
        {/* Looping video background (sits behind everything) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            src="/background-pulse.webm"
            className="h-full w-full object-cover"
          />
          {/* Navy tint over the video: raise 60 for darker, lower for clearer */}
          <div className="absolute inset-0 bg-[#0A1A33]/70" />
        </div>

        {/* Shared navigation bar */}
        <Navbar />

        {/* Page content (above the background) */}
        <main className="relative z-10 flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  )
}