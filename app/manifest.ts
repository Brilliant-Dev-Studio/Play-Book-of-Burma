import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Playbook of Burma",
    short_name: "Playbook",
    description:
      "A Myanmar-focused video and podcast learning platform featuring founders, CEOs, and experts.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ec7147",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
