import { CompareProvider } from "@/lib/compare-context";
import { getCities } from "@/lib/api/public";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Navigation should never take the whole site down if the API is unreachable.
  const cities = await getCities().catch(() => []);

  return (
    <CompareProvider>
      <Navbar cities={cities} />
      <main className="flex-1">{children}</main>
      <Footer cities={cities} />
    </CompareProvider>
  );
}
