import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@/utils/generateOgImages";

export const GET: APIRoute = async () => {
  const image = await generateOgImageForSite();
  const buffer = image.buffer as ArrayBuffer;
  const body = buffer.slice(image.byteOffset, image.byteOffset + image.byteLength);

  return new Response(body, {
    headers: { "Content-Type": "image/png" },
  });
};
