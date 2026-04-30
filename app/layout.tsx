import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Pixelify_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Slack uses Slack-Lato (proprietary). Lato is the closest free fallback —
// loading at 400/700/900 to cover regular body, semibold names, and the
// extra-heavy treatment Slack uses for unread channels and headers.
const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

// Pixelify Sans — readable pixel-art font for the Synko brand voice
// (pet messages, headline moments). Loaded at 400/600/700.
const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synko",
  description: "A team communication pet for cross-departmental collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${pixelifySans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
