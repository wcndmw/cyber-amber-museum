import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const comments = await prisma.comment.findMany({
      where: { postId: id, parentId: null },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        replies: {
          take: 5,
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    const hasMore = comments.length > limit;
    const data = hasMore ? comments.slice(0, limit) : comments;

    return NextResponse.json({
      comments: data.map((c) => ({
        id: c.id,
        content: c.content,
        author: c.user,
        replies: c.replies.map((r) => ({
          id: r.id,
          content: r.content,
          author: r.user,
          createdAt: r.createdAt.toISOString(),
        })),
        createdAt: c.createdAt.toISOString(),
      })),
      pagination: {
        cursor: hasMore ? data[data.length - 1].id : null,
        hasMore,
      },
    });
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const body = await req.json();
    const { content, parentId } = body;
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "评论不能为空" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId,
        parentId: parentId || null,
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    // Notify post author
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (post && post.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          actorId: userId,
          type: "comment",
          postId,
          commentId: comment.id,
        },
      });
    }

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      author: comment.user,
      createdAt: comment.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}
