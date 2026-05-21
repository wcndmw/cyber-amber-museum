import { PostGrid } from "@/components/posts/post-grid";

export default async function ExplorePage() {
  let posts: any[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/posts?sort=popular&limit=20`, { cache: "no-store" });
    const data = await res.json();
    posts = data.posts || [];
  } catch {
    // Fallback
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">探索</h1>
      <p className="text-sm text-muted-foreground mb-6">发现社区中的热门作品</p>
      <PostGrid posts={posts} emptyMessage="还没有作品" />
    </div>
  );
}
