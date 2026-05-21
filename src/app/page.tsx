"use client";

import { useCallback, useEffect, useState } from "react";
import { PostGrid } from "@/components/posts/post-grid";
import { LoadMore } from "@/components/common/load-more";
import { ArrowUpDown } from "lucide-react";

type SortType = "latest" | "popular" | "featured";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sort, setSort] = useState<SortType>("latest");
  const [error, setError] = useState("");

  const fetchPosts = useCallback(
    async (reset = false) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ sort, limit: "12" });
        if (!reset && cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/posts?${params}`);
        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error || "加载失败");
          return;
        }

        if (reset) {
          setPosts(data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        }
        setCursor(data.pagination?.cursor || null);
        setHasMore(data.pagination?.hasMore ?? false);
      } catch {
        setError("网络错误，请刷新重试");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [sort, cursor]
  );

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoading(true);
    setError("");
    fetchPosts(true);
  }, [sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-gold to-amber-light">
          <span className="text-cyber-bg text-3xl font-black">琥</span>
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">
          赛博<span className="text-gradient-amber">琥珀</span>博物馆
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          游戏玩家的作品分享社区。珍藏游戏世界的每一个惊艳瞬间。
        </p>
      </section>

      {/* Sort */}
      <div className="mb-6 flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        {(["latest", "popular", "featured"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sort === s
                ? "bg-amber-gold text-cyber-bg"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "latest" && "最新"}
            {s === "popular" && "热门"}
            {s === "featured" && "精选"}
          </button>
        ))}
      </div>

      {/* Posts */}
      {error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchPosts(true)}
            className="rounded-lg bg-amber-gold/20 px-4 py-2 text-xs text-amber-gold hover:bg-amber-gold/30 transition-colors"
          >
            点击重试
          </button>
        </div>
      ) : initialLoading ? (
        <PostGrid posts={[]} emptyMessage="加载中..." />
      ) : (
        <>
          <PostGrid posts={posts} />
          <LoadMore onLoadMore={() => fetchPosts()} hasMore={hasMore} loading={loading} />
        </>
      )}
    </div>
  );
}
