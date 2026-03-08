import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ChangeSetProvider } from "./ChangeSetContext";
import { AuthProvider } from "./AuthContext";
import { ProtectedLayout } from "./ProtectedLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NHP Web Designer",
  description: "Content management system for NHP website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ProtectedLayout>
            <ChangeSetProvider>
              <nav className="bg-black text-white p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <Link href="/" className="text-2xl font-black">NHP Designer</Link>
                  <div className="flex gap-6">
                    <Link href="/articles" className="hover:text-yellow-400 transition-colors font-semibold">Articles</Link>
                    <Link href="/films" className="hover:text-gray-400 transition-colors font-semibold">Films</Link>
                    <Link href="/cast-crew" className="hover:text-pink-400 transition-colors font-semibold">Cast & Crew</Link>
                  </div>
                </div>
              </nav>
              {children}
            </ChangeSetProvider>
          </ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
