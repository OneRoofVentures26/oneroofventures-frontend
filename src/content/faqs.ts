import type { Faq } from "@/content/types";

/*
 * The /faq page, also emitted as FAQPage structured data. Answers lead with
 * the direct answer so they can be quoted as-is. Keep them in line with the
 * product (MAX_COMPARE, the score pillars, live cities) and the rate card in
 * src/lib/packages.ts.
 */

export interface FaqGroup {
  id: string;
  title: string;
  items: Faq[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "about",
    title: "About OneRoof Ventures",
    items: [
      {
        q: "What is OneRoof Ventures?",
        a: "OneRoof Ventures is a free comparison site for marketing agencies in Indian cities. You can filter agencies by service, area and budget, compare their published packages side by side, and request quotes from several agencies at once.",
      },
      {
        q: "Is OneRoof Ventures free to use?",
        a: "Yes. Comparing, shortlisting and requesting quotes from agencies is free for businesses, always. You don't need to sign up.",
      },
      {
        q: "Which cities does OneRoof Ventures cover?",
        a: "OneRoof Ventures is live in [Bangalore](/bangalore), [Hyderabad](/hyderabad) and [Delhi](/delhi), with more cities on the way.",
      },
      {
        q: "Which marketing services can I compare?",
        a: "SEO, social media marketing, paid ads (PPC / Google Ads), Meta Ads, website development, app development, answer engine optimisation (AEO) and combo packages.",
      },
      {
        q: "How does OneRoof Ventures make money?",
        a: "Agencies can pay to be seen more. When they do, the listing is labelled, and it never changes their One Roof Score. We also run our own [managed marketing packages](/services), kept separate from the agency comparison.",
      },
    ],
  },
  {
    id: "comparing",
    title: "Comparing agencies",
    items: [
      {
        q: "What is the One Roof Score?",
        a: "The One Roof Score (beta) shows how transparent, complete and well reviewed an agency's listing is. It combines three pillars: price transparency, profile completeness and reputation. It is not a judgement of the quality of the agency's work.",
      },
      {
        q: "Why do some agencies show 'New' instead of a score?",
        a: "An agency is scored once at least 3 of these facts are known: Google rating, founded year, case studies, a live website check and a recent review date. Until then it shows as New.",
      },
      {
        q: "What does the Verified badge mean?",
        a: "Verified agencies have had their listing details checked by the OneRoof Ventures team. Every listing also shows the date we last checked it.",
      },
      {
        q: "Can agencies pay for a higher score?",
        a: "No. Paid visibility is labelled on the listing and never changes the One Roof Score.",
      },
      {
        q: "How many agencies can I compare at once?",
        a: "Up to four. Add them to your shortlist from any listing, then open [Compare](/compare) to see their packages, prices and scores side by side.",
      },
      {
        q: "What does 'Price on request' mean?",
        a: "The agency hasn't published package prices. You can still request a quote from them, and filtering by budget shows agencies with at least one package within it.",
      },
    ],
  },
  {
    id: "quotes",
    title: "Getting quotes",
    items: [
      {
        q: "How do I get quotes from marketing agencies?",
        a: "Fill in the short [quote request form](/quote), which takes about a minute. We send your brief to the agencies you picked, or to the best matches if you didn't pick any, and they reply to you directly with a quote. One request, several quotes.",
      },
      {
        q: "Do I need to create an account?",
        a: "No. Requesting quotes doesn't need sign-up.",
      },
      {
        q: "Am I obliged to hire an agency after requesting quotes?",
        a: "No. Quotes are free and there is no obligation to hire anyone.",
      },
    ],
  },
  {
    id: "pricing",
    title: "Marketing costs",
    items: [
      {
        q: "How much does a digital marketing agency cost in India?",
        a: "Most small and mid-sized businesses pay ₹10,000–₹60,000 a month for an agency, plus ad spend. Single services such as SEO or social media usually start around ₹10,000 a month; full-service packages around ₹30,000. See the [full pricing guide](/articles/digital-marketing-agency-cost-india).",
      },
      {
        q: "Is ad spend included in an agency's price?",
        a: "Usually not. The agency's fee covers their work; ad spend is paid directly to Google or Meta, ideally from an ad account in your name.",
      },
      {
        q: "How much do SEO services cost per month?",
        a: "Typically ₹10,000–₹25,000 a month for a small local business and ₹25,000–₹75,000 for a growing business or e-commerce site. See [SEO packages and pricing](/articles/seo-packages-pricing-india).",
      },
      {
        q: "How much does social media marketing cost?",
        a: "Typically ₹8,000–₹25,000 a month for a basic package and ₹25,000–₹60,000 with reels, shoots and community management. See [social media package prices](/articles/social-media-marketing-packages-india).",
      },
      {
        q: "How much does a website cost in India?",
        a: "Around ₹15,000–₹60,000 for a 5–10 page business website and ₹50,000–₹3,00,000 for an e-commerce store. See [website development costs](/articles/website-development-cost-india).",
      },
    ],
  },
  {
    id: "managed",
    title: "OneRoof Ventures managed packages",
    items: [
      {
        q: "Does OneRoof Ventures offer its own marketing services?",
        a: "Yes. Our managed packages are Basic at ₹12,999, Growth at ₹29,999 and Premium at ₹44,999 a month, covering ads, creatives, social media and SEO. See [packages and pricing](/services).",
      },
      {
        q: "Is there a minimum commitment on managed packages?",
        a: "Yes, 3 months on every package. After that you can cancel anytime with 30 days' notice.",
      },
      {
        q: "Is ad spend included in the managed packages?",
        a: "No. Ad spend is paid by you directly to Meta, Google or other platforms and isn't part of our fee.",
      },
    ],
  },
  {
    id: "agencies",
    title: "For agencies",
    items: [
      {
        q: "How can my agency get listed on OneRoof Ventures?",
        a: "[Contact us](/contact) with your agency's name, city, website and services. Listings with published packages, case studies and reviews tend to score higher.",
      },
      {
        q: "How can my agency improve its One Roof Score?",
        a: "Publish clear package prices, complete your profile (founded year, team size, case studies), keep your website live and collect recent Google reviews.",
      },
    ],
  },
];
