import { redirect } from "next/navigation";

import { DiscoveryView } from "@/components/discovery/DiscoveryView";
import { createClient } from "@/supabase/server";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/discover");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 pb-24">
      <DiscoveryView />
    </main>
  );
}
