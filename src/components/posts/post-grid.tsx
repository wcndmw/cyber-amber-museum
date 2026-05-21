import { PostCard } from "./post-card";

interface Post {
  id: string;
  title: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  mediaType: "image" | "video";
  gameName?: string | null;
  tags: string[];
  viewCount: number;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  author: {
    username: string;
    avatarUrl?: string | null;
  };
}

interface PostGridProps {
  posts: Post[];
  emptyMessage?: string;
}

export function PostGrid({ posts, emptyMessage = "还没有作品，快来发布第一个吧！" }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <span className="text-2xl">📸</span>
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
