import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dromocob — Film, Web ve Growth Sistemleri",
    short_name: "Dromocob",
    description: "Film prodüksiyonu, web ürünleri, SEO ve dijital büyüme sistemleri.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f0c",
    theme_color: "#d7ff35",
    lang: "tr-TR",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
