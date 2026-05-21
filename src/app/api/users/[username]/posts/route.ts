import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);

    const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;

    return NextResponse.json({
      posts: data.map((p) => ({
        id: p.id,
        title: p.title,
        mediaUrl: p.mediaUrl,
        thumbnailUrl: p.thumbnailUrl,
        mediaType: p.mediaType,
        gameName: p.gameName,
        tags: p.tags,
        viewCount: p.viewCount,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        author: p.author,
        createdAt: p.createdAt.toISOString(),
      })),
      pagination: { cursor: hasMore ? data[data.length - 1].id : null, hasMore },
    });
  } catch {
    return NextResponse.json({ error: "获取作品列表失败" }, { status: 500 });
  }
}
