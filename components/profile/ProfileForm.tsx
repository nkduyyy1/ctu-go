"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { upsertMyProfile } from "@/app/actions/profileActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ProfileData = {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  campus: string | null;
  faculty: string | null;
  year: string | null;
  interests: string[] | null;
  discovery_opt_in: boolean | null;
};

export function ProfileForm({ initialData }: { initialData: ProfileData | null }) {
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [campus, setCampus] = useState(initialData?.campus || "");
  const [faculty, setFaculty] = useState(initialData?.faculty || "");
  const [year, setYear] = useState(initialData?.year || "");
  const [interestsInput, setInterestsInput] = useState(
    (initialData?.interests || []).join(", ")
  );
  const [discoveryOptIn, setDiscoveryOptIn] = useState(
    initialData?.discovery_opt_in || false
  );

  const onSave = () => {
    const interests = interestsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await upsertMyProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
        bio,
        campus,
        faculty,
        year,
        interests,
        discovery_opt_in: discoveryOptIn,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ho ten" />
        <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Avatar URL" />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="border-input h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        />
        <Input value={campus} onChange={(e) => setCampus(e.target.value)} placeholder="Campus" />
        <Input value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="Faculty/Major" />
        <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
        <Input
          value={interestsInput}
          onChange={(e) => setInterestsInput(e.target.value)}
          placeholder="Interests, phan cach boi dau phay"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={discoveryOptIn}
            onChange={(e) => setDiscoveryOptIn(e.target.checked)}
          />
          Tham gia Tinder discovery
        </label>
        <Button onClick={onSave} disabled={isPending} className="w-full">
          Luu profile
        </Button>
      </CardContent>
    </Card>
  );
}
