"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, MessageCircle, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    if (!session?.user?.id) return;
    fetch("/api/notifications", {
      headers: { "x-user-id": session.user.id },
    })
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      // Mark all as read
      fetch("/api/notifications", {
        method: "PUT",
        headers: { "x-user-id": session.user.id },
      });
    }
  }, [session]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">通知</h1>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-3 opacity-30" />
          <p>暂无通知</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.post ? `/post/${n.post.id}` : "#"}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-card border border-transparent hover:border-border/20"
            >
              <div className="mt-0.5 text-muted-foreground">
                {n.type === "like" ? <Heart className="h-4 w-4 text-destructive" /> : <MessageCircle className="h-4 w-4 text-amber-gold" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{n.actor?.username || "某用户"}</span>
                  {n.type === "like" ? " 赞了你的作品" : " 评论了你的作品"}
                  {n.post && <span className="text-muted-foreground">「{n.post.title}」</span>}
                </p>
                {n.comment?.content && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.comment.content}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
