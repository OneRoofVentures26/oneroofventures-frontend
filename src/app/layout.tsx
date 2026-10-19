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
  // Lets env(safe-area-inset-*) report the iPhone home indicator for the sticky bars.
  viewportFit: "cover",
  // Matches the navbar's cream glass.
  themeColor: "#F4EADF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
