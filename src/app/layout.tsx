import type { Metadata } from 'next'
import { Noto_Serif, Crimson_Pro, IM_Fell_English, Noto_Serif_Devanagari } from 'next/font/google'
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

const notoSerifDevanagari = Noto_Serif_Devanagari({
  variable: '--font-devanagari',
  subsets: ['devanagari'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Notational — Carnatic Music Notation',
  description: 'Professional Carnatic music notation system with full talam support',
  icons: { icon: '/logo.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSerif.variable} ${crimsonPro.variable} ${imFellEnglish.variable} ${notoSerifDevanagari.variable} theme-parchment`}
        style={{
          fontFamily: 'var(--font-crimson-pro, "Crimson Pro", Georgia, serif)',
        }}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var ids=['parchment','midnight','forest','ocean','slate','rosewood'];var t=localStorage.getItem('notational_theme');if(!t&&localStorage.getItem('notational_dark')==='true')t='midnight';if(!t||ids.indexOf(t)<0)t='parchment';ids.forEach(function(id){document.body.classList.remove('theme-'+id)});document.body.classList.add('theme-'+t);document.body.dataset.theme=t;}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
