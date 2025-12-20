import { DotGothic16, Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import { AuthProvider } from "@/contexts/auth-context";
import { PopupProvider } from "@/contexts/popup-context";

import { Providers } from "./providers";

import type { Metadata } from "next";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dotGothic = DotGothic16({
  variable: "--font-dot-gothic",
  weight: "400",
  subsets: ["latin"],
});

const zenKurenaido = localFont({
  src: "../../public/fonts/ZenKurenaido-Regular.ttf",
  variable: "--font-zen-kurenaido",
});

const madoufmg = localFont({
  src: "../../public/fonts/madoufmg.ttf",
  variable: "--font-madoufmg",
});

export const metadata: Metadata = {
  title: "Auth Demo",
  description: "Authentication demo with Hono and Supabase",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dotGothic.variable} ${zenKurenaido.variable} ${madoufmg.variable} antialiased`}
      >
        <AuthProvider>
          <PopupProvider>
            <Providers>{children}</Providers>
          </PopupProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
