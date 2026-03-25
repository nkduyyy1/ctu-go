"use server";

import { z } from "zod";

import { withActionLog } from "@/lib/server-action-log";
import { createClient } from "@/supabase/server";

const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  avatar_url: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  campus: z.string().min(1).max(100),
  faculty: z.string().max(100).optional().or(z.literal("")),
  year: z.string().max(50).optional().or(z.literal("")),
  interests: z.array(z.string().min(1).max(50)).max(20),
  discovery_opt_in: z.boolean(),
});

export async function getMyProfile() {
  return withActionLog("profile/getMyProfile", async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data };
  });
}

export async function upsertMyProfile(input: {
  full_name: string;
  avatar_url?: string;
  bio?: string;
  campus: string;
  faculty?: string;
  year?: string;
  interests: string[];
  discovery_opt_in: boolean;
}) {
  return withActionLog("profile/upsertMyProfile", async () => {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Thong tin profile khong hop le" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: parsed.data.full_name,
      avatar_url: parsed.data.avatar_url || null,
      bio: parsed.data.bio || null,
      campus: parsed.data.campus,
      faculty: parsed.data.faculty || null,
      year: parsed.data.year || null,
      interests: parsed.data.interests,
      discovery_opt_in: parsed.data.discovery_opt_in,
    },
    { onConflict: "id" }
  );

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Cap nhat profile thanh cong" };
  });
}
