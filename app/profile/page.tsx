import { redirect } from "next/navigation";

import { getMyProfile } from "@/app/actions/profileActions";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createClient } from "@/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const res = await getMyProfile();
  const profile = res.success ? res.data : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-10">
      <ProfileForm initialData={profile || null} />
    </main>
  );
}
