import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import { SITE_URL } from "@/lib/config";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "OneRoof Ventures | Compare Top Marketing Agencies in India",
  description:
    "Compare the top marketing agencies in 10 Indian cities on price, services and verified reviews. Free for businesses.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D17" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets the theme class on <html> before paint.
    <html lang="en" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
