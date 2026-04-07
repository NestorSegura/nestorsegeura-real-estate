import { Geist_Mono, DM_Sans } from 'next/font/google'
import 'lenis/dist/lenis.css'
import './globals.css'
import { SmoothScroll } from '@/components/SmoothScroll'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${dmSans.variable} ${geistMono.variable} antialiased`}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  )
}
