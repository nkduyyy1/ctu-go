import { Database } from "@/supabase/database.types";

export type DBLocation = Database["public"]["Tables"]["locations"]["Row"];
export type DBCategory = Database["public"]["Tables"]["categories"]["Row"];

export type LocationWithCategory = DBLocation & {
  categories: DBCategory | null;
  lat: number;
  lng: number;
};

export type GetLocationsResponse = {
  locations: LocationWithCategory[];
  count?: number;
};
