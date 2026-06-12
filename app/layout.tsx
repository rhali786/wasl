import type { Metadata } from "next";
import { Hanken_Grotesk, Amiri_Quran, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { MoodShell } from "@/features/shell/components/MoodShell";
import { SessionProvider } from "@/features/session/components/SessionProvider";
import { AuthGate } from "@/features/onboarding/components/AuthGate";

// UI / system chrome — labels, numbers, buttons, navigation (design-visual.md §Typography)
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

// Qur'anic Arabic text — nothing else uses this face
const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-arabic",
});

// English display — word meanings, calm pull-quotes (italic translation register)
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Wird",
  description: "A daily devotional return — Qur'an review companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${amiriQuran.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthGate>
          <MoodShell>
            <SessionProvider>{children}</SessionProvider>
          </MoodShell>
        </AuthGate>
      </body>
    </html>
  );
}
