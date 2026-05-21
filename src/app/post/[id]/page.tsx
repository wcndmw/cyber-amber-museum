"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, MessageCircle, Trash2, ArrowLeft, Share2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      });

    fetch(`/api/posts/${id}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []));
  }, [id]);

  const toggleLike = async () => {
    if (!session) return;
    const res = await fetch(`/api/posts/${id}/like`, {
      method: "POST",
      headers: { "x-user-id": session.user?.id || "" },
    });
    const data = await res.json();
    setLiked(data.liked);
    if (post) {
      setPost({ ...post, likeCount: post.likeCount + (data.liked ? 1 : -1) });
    }
  };

  const submitComment = async () => {
    if (!session || !commentText.trim()) return;
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.user?.id || "",
      },
      body: JSON.stringify({
        content: commentText,
        parentId: replyTo?.id || null,
      }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setReplyTo(null);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!session) return;
    await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { "x-user-id": session.user?.id || "" },
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">加载中...</div>;
  }

  if (!post) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">作品不存在</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> 返回首页
      </Link>

      {/* Media */}
      <div className="rounded-xl overflow-hidden bg-black/50 mb-6">
        {post.mediaType === "video" ? (
          <video controls src={post.mediaUrl} className="w-full max-h-[60vh] object-contain" />
        ) : (
          <img src={post.mediaUrl} alt={post.title} className="w-full max-h-[60vh] object-contain" />
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{post.title}</h1>
          {post.gameName && <p className="text-sm text-muted-foreground mt-1">{post.gameName}</p>}
          {post.description && <p className="mt-3 text-sm leading-relaxed">{post.description}</p>}

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.map((tag: string) => (
                <span key={tag} className="rounded-full border border-border/30 px-2.5 py-1 text-xs text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-3 mt-6 p-3 rounded-lg bg-card border border-border/20">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {post.author.avatarUrl ? (
                <img src={post.author.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm">{post.author.username[0]}</span>
              )}
            </div>
            <div>
              <Link href={`/user/${post.author.username}`} className="font-medium hover:text-amber-gold transition-colors">
                {post.author.username}
              </Link>
              {post.author.bio && <p className="text-xs text-muted-foreground">{post.author.bio}</p>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="lg:w-80">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border/20">
            <button onClick={toggleLike} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}>
              <Heart className={`h-5 w-5 ${liked ? "fill-destructive" : ""}`} />
              {post.likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="h-5 w-5" /> {post.commentCount}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
              <Share2 className="h-4 w-4" />
            </span>
          </div>

          {/* Comments */}
          <div className="mt-4">
            <h3 className="font-semibold mb-3">评论 ({post.commentCount})</h3>

            {session && (
              <div className="mb-4">
                {replyTo && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
                    回复 @{replyTo.username}
                    <button onClick={() => setReplyTo(null)} className="text-destructive ml-1">取消</button>
                  </div>
                )}
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="写下你的评论..."
                  className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none resize-none placeholder:text-muted-foreground/50 h-20"
                />
                <Button onClick={submitComment} className="amber-btn mt-2 text-xs" disabled={!commentText.trim()}>发表</Button>
              </div>
            )}

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-card/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Link href={`/user/${comment.author.username}`} className="text-xs font-medium hover:text-amber-gold">
                      {comment.author.username}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      {session?.user?.id === comment.author.id && (
                        <button onClick={() => deleteComment(comment.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  <button
                    onClick={() => session && setReplyTo({ id: comment.id, username: comment.author.username })}
                    className="text-[10px] text-muted-foreground hover:text-amber-gold mt-1"
                  >
                    回复
                  </button>

                  {comment.replies?.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2 border-l-2 border-border/20 pl-3">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id}>
                          <div className="flex items-center gap-2">
                            <Link href={`/user/${reply.author.username}`} className="text-xs font-medium hover:text-amber-gold">
                              {reply.author.username}
                            </Link>
                            <span className="text-[10px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-xs mt-0.5">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
