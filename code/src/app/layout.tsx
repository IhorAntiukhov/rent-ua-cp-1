import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { ServicesProvider } from "@/container/ServicesProvider.tsx";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "RentUA",
  description: "Довгострокова оренда житла в містах України",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServicesProvider>
          <AuthProvider>{children}</AuthProvider>
        </ServicesProvider>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
