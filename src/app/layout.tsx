import type { Metadata } from "next"
import { DM_Sans, IBM_Plex_Mono, Instrument_Serif } from "next/font/google"
import "./globals.css"
import Providers from "@/components/layout/Providers"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
})

export const metadata: Metadata = {
  title: "Nullspace — Query the dark. Never touch the data.",
  description:
    "A private data marketplace on Story's Confidential Data Rails (CDR). Query confidential datasets without ever touching the data.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
