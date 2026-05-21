"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = registerSchema.safeParse({ username, email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
      } else {
        router.push("/auth/login");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 overflow-hidden rounded-xl">
            <img src="/logo.jpg" alt="赛博琥珀博物馆" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-xl font-bold">创建账号</h1>
          <p className="text-sm text-muted-foreground mt-1">加入赛博琥珀博物馆</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-amber-gold/50 focus:ring-1 focus:ring-amber-gold/20"
              placeholder="你的昵称"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-amber-gold/50 focus:ring-1 focus:ring-amber-gold/20"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-amber-gold/50 focus:ring-1 focus:ring-amber-gold/20"
              placeholder="至少6位"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="amber-btn w-full" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          已有账号？{" "}
          <Link href="/auth/login" className="text-amber-gold hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
