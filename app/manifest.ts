import type { MetadataRoute } from "next";

/** Icônes générées par `npm run icons:pwa` (logo sur fond noir) */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ÉTS Hub",
    short_name: "ÉTS Hub",
    description:
      "Trouvez rapidement une salle libre a l'ETS et consultez les horaires de cours et des enseignants (été 2026).",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
