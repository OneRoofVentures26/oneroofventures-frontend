import type { Article } from "@/content/types";

/*
 * City guides. Kept generic on purpose: no named "best" agencies, since the
 * live listings (with their published prices and scores) are the source of
 * truth for that and change daily.
 */

interface CityGuide {
  name: string;
  slug: string;
  areas: string[];
  industries: string[];
  /** One sentence on the local market. */
  market: string;
}

const CITIES: CityGuide[] = [
  {
    name: "Bangalore",
    slug: "bangalore",
    areas: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar", "Electronic City", "Hebbal"],
    industries: ["SaaS and tech startups", "D2C brands", "clinics and healthcare", "real estate", "education and edtech", "restaurants and cafes"],
    market:
      "Bangalore has one of India's largest concentrations of digital marketing agencies, from startup-focused performance marketing teams to full-service agencies serving local businesses.",
  },
  {
    name: "Hyderabad",
    slug: "hyderabad",
    areas: ["HITEC City", "Madhapur", "Gachibowli", "Banjara Hills", "Jubilee Hills", "Kondapur", "Secunderabad"],
    industries: ["IT and tech services", "real estate", "healthcare and hospitals", "education", "pharma", "restaurants and retail"],
    market:
      "Hyderabad's agency market has grown with the city's tech and real estate boom, with many agencies clustered around HITEC City, Madhapur and Gachibowli.",
  },
  {
    name: "Delhi",
    slug: "delhi",
    areas: ["Connaught Place", "Nehru Place", "Saket", "Lajpat Nagar", "Rajouri Garden", "Dwarka", "Pitampura"],
    industries: ["retail and fashion", "education and coaching", "healthcare", "real estate", "B2B and exporters", "hospitality"],
    market:
      "Delhi and the wider NCR have a large, competitive agency market, with a wide spread of prices from small studios to large full-service agencies.",
  },
];

function cityGuide(c: CityGuide, others: string[]): Article {
  return {
    slug: `digital-marketing-agencies-in-${c.slug}`,
    title: `How to find the right digital marketing agency in ${c.name} (2026 guide)`,
    metaTitle: `Digital Marketing Agencies in ${c.name}: Prices, Packages & How to Choose (2026)`,
    description: `A guide to hiring a digital marketing agency in ${c.name}: typical prices for SEO, social media, Google and Meta Ads, where agencies are based, and how to compare published packages.`,
    category: "City guides",
    keywords: [
      `digital marketing agency in ${c.name}`,
      `best digital marketing agencies in ${c.name}`,
      `SEO agency in ${c.name}`,
      `social media marketing agency ${c.name}`,
      `Google Ads agency ${c.name}`,
      `digital marketing company ${c.name}`,
      `marketing agency near me ${c.name}`,
    ],
    publishedAt: "2026-10-26",
    updatedAt: "2026-10-26",
    quickAnswer: `To find a good digital marketing agency in ${c.name}, filter agencies by the service you need (SEO, social media, Google Ads, Meta Ads or websites), compare their published packages and recent Google reviews, shortlist three or four, and request quotes from all of them at once. Most small businesses in ${c.name} pay ₹10,000–₹60,000 a month for an agency, plus ad spend. OneRoof Ventures lists ${c.name} agencies with their prices so you can compare them side by side.`,
    takeaways: [
      `Compare ${c.name} agencies on published packages, not just their websites.`,
      "Separate the agency's fee from your ad spend when comparing quotes.",
      "Shortlist agencies near you only if you need regular shoots or meetings.",
    ],
    sections: [
      {
        id: "market",
        heading: `The digital marketing agency market in ${c.name}`,
        blocks: [
          c.market,
          `Agencies here commonly work with ${c.industries.join(", ")}. Many are based in or around ${c.areas.slice(0, -1).join(", ")} and ${c.areas[c.areas.length - 1]}, though most can work with clients anywhere in the city.`,
          `See every listed agency, with prices, on the [${c.name} agencies page](/${c.slug}).`,
        ],
      },
      {
        id: "prices",
        heading: `What agencies in ${c.name} charge`,
        blocks: [
          "Typical monthly agency fees for small and mid-sized businesses, before ad spend and GST:",
          {
            table: {
              head: ["Service", "Typical monthly fee", `Compare in ${c.name}`],
              rows: [
                ["SEO", "₹10,000 – ₹75,000", `[SEO agencies](/${c.slug}/services/seo)`],
                ["Social media marketing", "₹8,000 – ₹60,000", `[Social media agencies](/${c.slug}/services/social-media)`],
                ["Google Ads (PPC)", "₹8,000 – ₹50,000 or 10–20% of spend", `[PPC agencies](/${c.slug}/services/ppc)`],
                ["Meta Ads", "₹8,000 – ₹50,000", `[Meta Ads agencies](/${c.slug}/services/meta-ads)`],
                ["Website development", "₹15,000 – ₹2,00,000 one time", `[Website agencies](/${c.slug}/services/website)`],
                ["AEO (AI search)", "Often part of SEO packages", `[AEO agencies](/${c.slug}/services/answer-engine-optimization)`],
              ],
            },
          },
          "For the full breakdown, read [how much a digital marketing agency costs in India](/articles/digital-marketing-agency-cost-india).",
        ],
      },
      {
        id: "how-to-choose",
        heading: `How to choose an agency in ${c.name}`,
        blocks: [
          {
            list: [
              "Pick one goal: leads, online sales, footfall or search visibility.",
              `Filter ${c.name} agencies by service, area and budget.`,
              "Check published packages, case studies and recent Google reviews.",
              "Shortlist three or four and compare them side by side.",
              "Send one quote request to all of them, then compare deliverables and contracts.",
            ],
            ordered: true,
          },
          "Our [7-step checklist](/articles/how-to-choose-digital-marketing-agency) and [15 questions to ask an agency](/articles/questions-to-ask-marketing-agency) go into more detail.",
        ],
      },
      {
        id: "oneroof",
        heading: `Comparing ${c.name} agencies on OneRoof Ventures`,
        blocks: [
          `Every ${c.name} agency on OneRoof Ventures shows its services, published Starter, Growth and Pro packages where available, Google rating and a One Roof Score (beta), a measure of how transparent, complete and well reviewed the listing is. Shortlist up to four agencies, [compare them](/compare), and [request quotes](/quote) from all of them in one go. It's free for businesses.`,
          `Also live in ${others.join(" and ")}.`,
        ],
      },
    ],
    faqs: [
      {
        q: `How much does a digital marketing agency cost in ${c.name}?`,
        a: `Most small and mid-sized businesses in ${c.name} pay between ₹10,000 and ₹60,000 a month for an agency, depending on the services and volume of work, plus ad spend paid to Google or Meta.`,
      },
      {
        q: `Which is the best digital marketing agency in ${c.name}?`,
        a: `It depends on your goal, industry and budget. The best agency for a D2C brand's Meta Ads is rarely the best one for a clinic's local SEO. Compare ${c.name} agencies by service on their published packages, reviews and One Roof Score, then talk to your top three or four.`,
      },
      {
        q: `Do I need an agency located in ${c.name}?`,
        a: "Not for ads, SEO or most social media work, which is done online. A local agency helps if you need regular photo and video shoots or in-person meetings.",
      },
    ],
    related: ["how-to-choose-digital-marketing-agency", "digital-marketing-agency-cost-india", "questions-to-ask-marketing-agency"],
  };
}

export const CITY_GUIDES: Article[] = CITIES.map((c) =>
  cityGuide(
    c,
    CITIES.filter((o) => o.slug !== c.slug).map((o) => `[${o.name}](/${o.slug})`),
  ),
);
