import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abhyaas | National Academic Fellowship & Skill Assessment Portal",
  description: "Pure merit-based academic assessments, high-yield practice drills, and endowed research fellowship evaluations for serious competitive aspirants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          {/* Global Header */}
          <Navbar />

          {/* Dynamic Page Content */}
          <main className="flex-1 w-full pb-16 lg:pb-0">{children}</main>

          {/* Persistent Academic Compliance Footer */}
          <Footer />

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}