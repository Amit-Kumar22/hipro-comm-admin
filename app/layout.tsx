import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import AdminLayout from "./admin-layout";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hiprotech Admin - Management Panel",
  description: "Administrative panel for managing Hiprotech e-commerce platform",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <AdminLayout>
            {children}
          </AdminLayout>
        </Providers>
      </body>
    </html>
  );
}
