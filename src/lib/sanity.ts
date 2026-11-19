import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import { createImageUrlBuilder } from "@sanity/image-url";

// PUBLIC_SITE decide qué sitio carga esta plantilla (siteSettings + docs con
// `site` apuntando a él). Un deploy por sitio; mismo código.
export const SITE = (import.meta.env.PUBLIC_SITE as string | undefined) ?? "contadores";
export const SITE_ID = `siteSettings-${SITE}`;

// Preview local de borradores: PUBLIC_SANITY_PERSPECTIVE=previewDrafts en .env
// (solo dev). En producción el sitio lee lo publicado.
const previewDrafts = import.meta.env.PUBLIC_SANITY_PERSPECTIVE === "drafts";
export const client = previewDrafts
  ? sanityClient.withConfig({ perspective: "drafts" })
  : sanityClient;

const builder = createImageUrlBuilder(client);
type SanityImage = Parameters<typeof builder.image>[0];

export function urlFor(source: SanityImage) {
  return builder.image(source).auto("format").fit("max");
}

export function waLink(whatsapp: string, text: string) {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// El draft del singleton tiene id `drafts.<id>`; la consulta lo cubre en
// ambas perspectivas.
export const SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && (_id == $siteId || _id == "drafts." + $siteId)][0]{
    name, sectorTitle, theme, seoTitle, seoDescription, footerNote,
    logo, heroTitle, heroLead, heroImage, ctaPrimary, ctaSecondary,
    stats[]{_key, value, label},
    aboutTitle, about,
    process[]{_key, title, description},
    labels,
    contact
  }
`);

export const SERVICES_QUERY = defineQuery(`
  *[_type == "service" && site._ref == $siteId] | order(order asc){
    _id, title, problem
  }
`);

export const TEAM_QUERY = defineQuery(`
  *[_type == "teamMember" && site._ref == $siteId] | order(order asc){
    _id, name, role, photo
  }
`);

export const CASES_QUERY = defineQuery(`
  *[_type == "caseStudy" && site._ref == $siteId] | order(order asc){
    _id, title, situation, result
  }
`);

export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial" && site._ref == $siteId] | order(order asc){
    _id, quote, authorDescriptor
  }
`);

export const FAQS_QUERY = defineQuery(`
  *[_type == "faq" && site._ref == $siteId] | order(order asc){
    _id, question, answer
  }
`);

export interface SanityImageField {
  asset?: { _ref?: string };
  alt?: string;
}

export interface SiteSettings {
  name?: string;
  sectorTitle?: string;
  theme?: string;
  seoTitle?: string;
  seoDescription?: string;
  footerNote?: string;
  logo?: SanityImageField;
  heroTitle?: string;
  heroLead?: string;
  heroImage?: SanityImageField;
  ctaPrimary?: string;
  ctaSecondary?: string;
  stats?: Array<{ _key?: string; value?: string; label?: string }>;
  aboutTitle?: string;
  about?: string;
  process?: Array<{ _key?: string; title?: string; description?: string }>;
  labels?: Record<string, string>;
  contact?: {
    whatsapp?: string;
    phone?: string;
    email?: string;
    address?: string;
    hours?: Array<{ _key?: string; days?: string; time?: string }>;
    mapEmbedUrl?: string;
    social?: Array<{ _key?: string; platform?: string; url?: string }>;
  };
}

export interface SiteData {
  settings?: SiteSettings;
  services: Array<{ _id?: string; title?: string; problem?: string }>;
  team: Array<{ _id?: string; name?: string; role?: string; photo?: SanityImageField }>;
  cases: Array<{ _id?: string; title?: string; situation?: string; result?: string }>;
  testimonials: Array<{ _id?: string; quote?: string; authorDescriptor?: string }>;
  faqs: Array<{ _id?: string; question?: string; answer?: string }>;
}

export async function fetchSite(): Promise<SiteData> {
  const params = { siteId: SITE_ID };
  const [settings, services, team, cases, testimonials, faqs] = await Promise.all([
    client.fetch(SETTINGS_QUERY, params),
    client.fetch(SERVICES_QUERY, params),
    client.fetch(TEAM_QUERY, params),
    client.fetch(CASES_QUERY, params),
    client.fetch(TESTIMONIALS_QUERY, params),
    client.fetch(FAQS_QUERY, params),
  ]);
  return { settings, services, team, cases, testimonials, faqs };
}
