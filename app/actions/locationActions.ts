"use server";

import { createClient } from "@/supabase/server";
import { z } from "zod";

import type { Location } from "@/types";

const getLocationsSchema = z.object({
  category: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().optional().default(1000),
});

export async function getLocations({
  category,
  limit = 200,
  offset = 0,
  search,
}: {
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("locations")
    .select(
      `
      id,
      location_id,
      name,
      description,
      image_url,
      details,
      geom,
      is_active,
      category_id,
      categories (
        id,
        slug,
        name,
        color
      )
    `
    )
    .eq("is_active", true)
    .order("name")
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category_id", category);
  }

  if (search && search.length > 2) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  const locations: Location[] = (data || []).map((loc) => ({
    id: loc.id,
    name: loc.name,
    type: "building",
    category: {
      id: loc.categories?.id || "",
      slug: loc.categories?.slug || "",
      name: loc.categories?.name || "",
      color: loc.categories?.color || "",
    },
    lat: loc.geom?.coordinates?.[1] || 0,
    lng: loc.geom?.coordinates?.[0] || 0,
    description: loc.description || "",
    image_url: loc.image_url || [""],
    details: loc.details || "",
    is_active: loc.is_active,
  }));

  return {
    locations,
    count: count || 0,
    hasMore: (count || 0) > offset + limit,
  };
}

// export async function getNearbyLocations({
//   lat,
//   lng,
//   radius = 1000,
//   limit = 10,
// }: {
//   lat: number;
//   lng: number;
//   radius?: number;
//   limit?: number;
// }) {
//   const supabase = await createClient();

//   const { data, error } = await supabase.rpc("nearby_locations", {
//     lat,
//     lng,
//     radius,
//     limit,
//   });

//   if (error) throw error;

//   return data as Location[];
// }

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getLocationById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select(
      `
      *,
      categories!inner(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
