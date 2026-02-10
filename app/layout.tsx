"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inter = Inter({ subsets: ["latin"] });

import { Header } from "@/components/layout/Header";

import { LoginPage } from "@/components/auth/LoginPage";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {!mounted ? (
          <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400">
            Carregando SKV...
          </div>
        ) : !currentUser ? (
          <LoginPage />
        ) : (
          <div className="flex h-screen bg-[#F8F9FB] overflow-hidden">
            <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-200/60 shadow-sm">
              <Sidebar />
            </aside>
            <div className="flex-1 flex flex-col md:pl-72 w-full transition-all duration-300 ease-in-out">
              <Header />
              <main className="flex-1 overflow-auto p-4 md:p-10">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
