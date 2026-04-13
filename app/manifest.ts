import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OFZ Workspace",
    short_name: "OFZ",
    description: "Elite virtual co-working and meeting space for high-performance teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ffdc42",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
