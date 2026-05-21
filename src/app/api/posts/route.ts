import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "latest";
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);

    const orderBy =
      sort === "popular"
        ? [{ likes: { _count: "desc" as const } }, { createdAt: "desc" as const }]
        : sort === "featured"
        ? [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy,
      include: {
        author: {
          select: { username: true, avatarUrl: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;

    const formatted = data.map((post) => ({
      id: post.id,
      title: post.title,
      mediaUrl: post.mediaUrl,
      thumbnailUrl: post.thumbnailUrl,
      mediaType: post.mediaType,
      gameName: post.gameName,
      tags: post.tags,
      viewCount: post.viewCount,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      author: post.author,
      createdAt: post.createdAt.toISOString(),
    }));

    return NextResponse.json({
      posts: formatted,
      pagination: {
        cursor: hasMore ? data[data.length - 1].id : null,
        hasMore,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("GET /api/posts error:", err.message, err.stack);
    return NextResponse.json({ error: `获取作品失败: ${err.message}` }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, gameName, mediaType, mediaUrl, tags } = body;
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const post = await prisma.post.create({
      data: {
        title,
        description,
        gameName,
        mediaType,
        mediaUrl,
        tags: tags || [],
        userId,
      },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}
