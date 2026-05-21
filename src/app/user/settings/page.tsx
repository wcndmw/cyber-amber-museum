"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUsername((session.user.name as string) || "");
    }
  }, [session]);

  if (status === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">加载中...</div>;
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.user?.id || "",
        },
        body: JSON.stringify({ username, bio: bio || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败");
      } else {
        router.refresh();
      }
    } catch {
      setError("保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">个人设置</h1>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">用户名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none focus:border-amber-gold/50"
            maxLength={30}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">个人简介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none resize-none focus:border-amber-gold/50 h-24"
            maxLength={500}
            placeholder="介绍一下自己..."
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button onClick={handleSave} className="amber-btn w-full" disabled={saving}>
          {saving ? "保存中..." : "保存设置"}
        </Button>
      </div>
    </div>
  );
}
