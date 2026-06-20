import type { PopularVideoItem } from "@/lib/server/popular-videos";
import type { UserPortalPodcastItem } from "@/lib/server/podcasts";

const BASE_URL = "https://playbookofburma.com";

function toIsoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `PT${h ? h + "H" : ""}${m ? m + "M" : ""}${s || (!h && !m) ? s + "S" : ""}`;
}

function Ld({ schema }: { schema: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <Ld
      schema={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${BASE_URL}${item.href}`,
        })),
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Ld
      schema={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <Ld
      schema={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Playbook of Burma",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        sameAs: [],
        description:
          "Myanmar's premier video and podcast learning platform featuring founders, CEOs, and business experts.",
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <Ld
      schema={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Playbook of Burma",
        url: BASE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/library?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function VideoListJsonLd({ items }: { items: PopularVideoItem[] }) {
  if (items.length === 0) return null;
  return (
    <Ld
      schema={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "VideoObject",
            name: [v.titleLine1, v.titleLine2].filter(Boolean).join(" — "),
            description: v.description,
            thumbnailUrl: v.thumbnailUrl,
            uploadDate: v.publishedAt ?? new Date().toISOString(),
            duration: toIsoDuration(v.durationSeconds),
            author: {
              "@type": "Person",
              name: v.instructorName,
              jobTitle: v.instructorTitle,
            },
            publisher: {
              "@type": "Organization",
              name: "Playbook of Burma",
              url: BASE_URL,
            },
          },
        })),
      }}
    />
  );
}

export function PodcastListJsonLd({
  items,
  seriesName = "Story of Burma Podcast",
}: {
  items: UserPortalPodcastItem[];
  seriesName?: string;
}) {
  if (items.length === 0) return null;
  return (
    <Ld
      schema={{
        "@context": "https://schema.org",
        "@type": "PodcastSeries",
        name: seriesName,
        url: BASE_URL,
        publisher: {
          "@type": "Organization",
          name: "Playbook of Burma",
          url: BASE_URL,
        },
        episode: items.map((p) => ({
          "@type": "PodcastEpisode",
          name: p.title,
          description: p.description,
          timeRequired: toIsoDuration(p.durationSeconds),
          image: p.thumbnailUrl,
          audio: {
            "@type": "AudioObject",
            contentUrl: p.audioUrl,
            duration: toIsoDuration(p.durationSeconds),
          },
        })),
      }}
    />
  );
}
