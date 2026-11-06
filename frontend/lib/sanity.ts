import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const sanityClient = createClient({
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.VITE_SANITY_PROJECT_ID ||
    "6rq4jwl0",
  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.VITE_SANITY_DATASET ||
    "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return builder.image(source as any);
}
