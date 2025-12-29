import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "AI PPT Generator | Create Stunning Presentations with AI",
  description: "Transform your text and documents into beautiful, professional PowerPoint presentations using AI. Upload PDFs, Word docs, or paste text to get started.",
  keywords: ["AI", "PowerPoint", "presentation", "generator", "slides", "automation"],
  authors: [{ name: "AI PPT Generator" }],
  openGraph: {
    title: "AI PPT Generator",
    description: "Create stunning presentations with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
