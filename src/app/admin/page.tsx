"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Trash2, Star } from "lucide-react";

export default function AdminPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"posts" | "users">("posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts?sort=latest&limit=50");
    const data = await res.json();
    setPosts(data.posts || []);
  };

  const fetchUsers = async () => {
    // In production, add a users list API
    setUsers([]);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id: string) => {
    await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": session?.user?.id || "" },
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  if (!session || (session.user as any)?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        无权访问管理后台
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>

      <div className="flex gap-2 mb-6">
        {(["posts", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? "bg-amber-gold text-cyber-bg" : "bg-secondary text-muted-foreground"
            }`}
          >
            {t === "posts" ? "内容管理" : "用户管理"}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20 text-left text-muted-foreground">
                <th className="pb-2 font-medium">作品</th>
                <th className="pb-2 font-medium">作者</th>
                <th className="pb-2 font-medium">点赞</th>
                <th className="pb-2 font-medium">评论</th>
                <th className="pb-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border/10">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <img src={post.thumbnailUrl || post.mediaUrl} alt="" className="h-8 w-12 rounded object-cover" />
                      <span className="line-clamp-1 max-w-[200px]">{post.title}</span>
                    </div>
                  </td>
                  <td className="py-2">{post.author?.username}</td>
                  <td className="py-2">{post.likeCount}</td>
                  <td className="py-2">{post.commentCount}</td>
                  <td className="py-2">
                    <button onClick={() => deletePost(post.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <p className="text-muted-foreground text-sm">用户管理功能开发中...</p>
      )}
    </div>
  );
}
