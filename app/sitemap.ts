import { MetadataRoute } from "next";
import { getLocations } from "@/app/actions/locationActions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ctugo.vercel.app";
  const { locations } = await getLocations({});

  const locationEntries = locations.map((loc) => ({
    url: `${baseUrl}/location/${loc.category?.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    ...locationEntries,
  ];
}
