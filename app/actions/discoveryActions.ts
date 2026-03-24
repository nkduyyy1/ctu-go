"use server";

import { z } from "zod";

import { createClient } from "@/supabase/server";

const targetSchema = z.object({
  targetUserId: z.string().uuid(),
});

export async function getDiscoveryUsers(limit = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const { data: myProfile, error: myError } = await supabase
    .from("profiles")
    .select("campus, discovery_opt_in")
    .eq("id", user.id)
    .single();

  if (myError) {
    return { success: false, message: myError.message };
  }

  if (!myProfile.discovery_opt_in) {
    return { success: false, message: "Ban can bat discovery de su dung tinh nang nay" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, campus, faculty, year, interests")
    .eq("discovery_opt_in", true)
    .eq("campus", myProfile.campus)
    .neq("id", user.id)
    .limit(limit);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

export async function getDiscoveryUserDetail(targetUserId: string) {
  const parsed = z.string().uuid().safeParse(targetUserId);
  if (!parsed.success) {
    return { success: false, message: "Target user khong hop le" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("campus, discovery_opt_in")
    .eq("id", user.id)
    .single();

  if (!myProfile?.discovery_opt_in) {
    return { success: false, message: "Ban chua bat discovery" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, campus, faculty, year, interests")
    .eq("id", parsed.data)
    .eq("campus", myProfile.campus)
    .eq("discovery_opt_in", true)
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

export async function likeUser(input: { targetUserId: string }) {
  const parsed = targetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Target user khong hop le" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const targetUserId = parsed.data.targetUserId;

  const { error: swipeError } = await supabase.from("user_swipes").upsert(
    {
      actor_user_id: user.id,
      target_user_id: targetUserId,
      action: "like",
    },
    { onConflict: "actor_user_id,target_user_id" }
  );

  if (swipeError) {
    return { success: false, message: swipeError.message };
  }

  const { data: reverseLike } = await supabase
    .from("user_swipes")
    .select("id")
    .eq("actor_user_id", targetUserId)
    .eq("target_user_id", user.id)
    .eq("action", "like")
    .maybeSingle();

  if (reverseLike) {
    const [userA, userB] = [user.id, targetUserId].sort();
    await supabase.from("user_matches").upsert(
      {
        user_a: userA,
        user_b: userB,
      },
      { onConflict: "user_a,user_b" }
    );
    return { success: true, matched: true, message: "Da match" };
  }

  return { success: true, matched: false, message: "Da like" };
}

export async function passUser(input: { targetUserId: string }) {
  const parsed = targetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Target user khong hop le" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const { error } = await supabase.from("user_swipes").upsert(
    {
      actor_user_id: user.id,
      target_user_id: parsed.data.targetUserId,
      action: "pass",
    },
    { onConflict: "actor_user_id,target_user_id" }
  );

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Da bo qua" };
}
