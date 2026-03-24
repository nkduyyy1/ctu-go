"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getDiscoveryUserDetail,
  getDiscoveryUsers,
  likeUser,
  passUser,
} from "@/app/actions/discoveryActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DiscoveryUser = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  campus: string | null;
  faculty: string | null;
  year: string | null;
  interests: string[] | null;
};

export function DiscoveryView() {
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<DiscoveryUser | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const res = await getDiscoveryUsers(50);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setUsers((res.data || []) as DiscoveryUser[]);
    });
  }, []);

  const selectedInterests = useMemo(
    () => (selectedUser?.interests || []).join(", "),
    [selectedUser]
  );

  const onOpenDetail = (userId: string) => {
    startTransition(async () => {
      const res = await getDiscoveryUserDetail(userId);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setSelectedUser(res.data as DiscoveryUser);
    });
  };

  const onLike = (targetUserId: string) => {
    startTransition(async () => {
      const res = await likeUser({ targetUserId });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.matched ? "Da match voi user nay" : "Ban da like user nay");
    });
  };

  const onPass = (targetUserId: string) => {
    startTransition(async () => {
      const res = await passUser({ targetUserId });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("Da bo qua");
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Danh sach discovery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-md border p-3">
              <div className="font-medium">{user.full_name || "Chua cap nhat ten"}</div>
              <div className="text-sm text-muted-foreground">{user.faculty || "Chua cap nhat khoa"}</div>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenDetail(user.id)}
                  disabled={isPending}
                >
                  Xem profile
                </Button>
                <Button size="sm" onClick={() => onLike(user.id)} disabled={isPending}>
                  Like
                </Button>
                <Button size="sm" variant="outline" onClick={() => onPass(user.id)} disabled={isPending}>
                  Pass
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="text-sm text-muted-foreground">Khong co user phu hop</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiet user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!selectedUser && <div className="text-sm text-muted-foreground">Chon mot user de xem chi tiet</div>}
          {selectedUser && (
            <>
              <div className="text-lg font-semibold">{selectedUser.full_name || "Chua cap nhat ten"}</div>
              <div>{selectedUser.bio || "Chua cap nhat bio"}</div>
              <div className="text-sm">Campus: {selectedUser.campus || "-"}</div>
              <div className="text-sm">Faculty: {selectedUser.faculty || "-"}</div>
              <div className="text-sm">Year: {selectedUser.year || "-"}</div>
              <div className="text-sm">Interests: {selectedInterests || "-"}</div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
