import type { Metadata } from "next";
import TurnstileScript from "@/components/TurnstileScript";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Voice Studio — Realistic German AI Voice",
  description:
    "Turn text into studio-quality German AI speech. Bavarian and Hochdeutsch voices, instant MP3 export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="antialiased">
        <TurnstileScript />
        {children}
      </body>
    </html>
  );
}
