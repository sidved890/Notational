import type { Metadata } from 'next'
import { Noto_Serif, Crimson_Pro, IM_Fell_English } from 'next/font/google'
import './globals.css'

const notoSerif = Noto_Serif({
  variable: '--font-noto-serif',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  variable: '--font-crimson-pro',
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const imFellEnglish = IM_Fell_English({
  variable: '--font-im-fell-english',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Notational — Carnatic Music Notation',
  description: 'Professional Carnatic music notation system with full tala support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSerif.variable} ${crimsonPro.variable} ${imFellEnglish.variable}`}
        style={{
          fontFamily: 'var(--font-crimson-pro, "Crimson Pro", Georgia, serif)',
        }}
      >
        {children}
      </body>
    </html>
  )
}
