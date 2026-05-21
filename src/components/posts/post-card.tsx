"use client";

import Link from "next/link";
import { Heart, MessageCircle, Eye, Play } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    mediaUrl: string;
    thumbnailUrl?: string | null;
    mediaType: "image" | "video";
    gameName?: string | null;
    tags: string[];
    viewCount: number;
    createdAt: string;
    _count?: { likes: number; comments: number };
    likeCount?: number;
    commentCount?: number;
    author: {
      username: string;
      avatarUrl?: string | null;
    };
  };
}

export function PostCard({ post }: PostCardProps) {
  const likeCount = post.likeCount ?? post._count?.likes ?? 0;
  const commentCount = post.commentCount ?? post._count?.comments ?? 0;

  return (
    <Link
      href={`/post/${post.id}`}
      className="group block rounded-xl border border-border/20 bg-card overflow-hidden transition-all hover:border-amber-gold/20 hover:shadow-lg hover:shadow-amber-gold/5"
    >
      {/* Media */}
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <img
          src={post.thumbnailUrl || post.mediaUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {post.mediaType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="h-10 w-10 text-white fill-white opacity-80" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-amber-gold transition-colors">
          {post.title}
        </h3>

        {post.gameName && (
          <p className="text-xs text-muted-foreground mt-0.5">{post.gameName}</p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/30 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/10">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-secondary">
              {post.author.avatarUrl ? (
                <img src={post.author.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  {post.author.username[0]}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {post.author.username}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Heart className="h-3 w-3" /> {likeCount}
            </span>
            <span className="flex items-center gap-0.5">
              <MessageCircle className="h-3 w-3" /> {commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
