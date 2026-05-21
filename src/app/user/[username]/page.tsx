"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { PostGrid } from "@/components/posts/post-grid";
import { LoadMore } from "@/components/common/load-more";
import { Camera, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then(setUser)
      .catch(console.error);
  }, [username]);

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "12" });
      if (!reset && cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/users/${username}/posts?${params}`);
      const data = await res.json();
      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setCursor(data.pagination.cursor);
      setHasMore(data.pagination.hasMore);
    } finally {
      setLoading(false);
    }
  }, [username, cursor]);

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    fetchPosts(true);
  }, [username]);

  if (!user) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Profile Header */}
      <div className="relative mb-8">
        {/* Banner */}
        <div className="h-40 sm:h-52 rounded-xl bg-gradient-to-br from-amber-gold/20 via-cyber-surface to-neon-cyan/10 overflow-hidden">
          {user.bannerUrl && (
            <img src={user.bannerUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        {/* Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16 px-4 sm:px-6">
          <div className="h-24 w-24 rounded-full border-4 border-cyber-bg overflow-hidden bg-secondary flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">{user.username[0]}</span>
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            {user.bio && <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> {user.postCount} 作品</span>
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {user.likeCount} 获赞</span>
              <span>加入于 {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <h2 className="text-lg font-semibold mb-4">作品集</h2>
      <PostGrid posts={posts} emptyMessage="还没有发布作品" />
      <LoadMore onLoadMore={() => fetchPosts()} hasMore={hasMore} loading={loading} />
    </div>
  );
}
