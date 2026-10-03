import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CompareProvider } from "@/lib/compare-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneRoof Ventures | Compare Top Marketing Agencies in India",
  description:
    "Compare the top marketing agencies in 10 Indian cities on price, services and verified reviews. Free for businesses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CompareProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CompareProvider>
      </body>
    </html>
  );
}
