import { HeroUIProvider } from "@heroui/react";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/contexts/auth-context";

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

export const metadata: Metadata = {
  title: "Auth Demo",
  description: "Authentication demo with Hono and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <HeroUIProvider>{children}</HeroUIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
