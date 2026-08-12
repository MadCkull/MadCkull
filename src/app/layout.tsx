import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
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
  title: "MadCkull — Hassan Ali",
  description:
    "Personal portfolio of Hassan Ali (MadCkull) — Data Science, AI, and Software Engineering.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
