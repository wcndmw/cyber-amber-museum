import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true, bio: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) return NextResponse.json({ error: "作品不存在" }, { status: 404 });

    await prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return NextResponse.json({
      id: post.id,
      title: post.title,
      description: post.description,
      mediaUrl: post.mediaUrl,
      thumbnailUrl: post.thumbnailUrl,
      mediaType: post.mediaType,
      gameName: post.gameName,
      tags: post.tags,
      isFeatured: post.isFeatured,
      viewCount: post.viewCount + 1,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      author: post.author,
      createdAt: post.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json({ error: "获取作品详情失败" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "作品不存在" }, { status: 404 });
    if (post.userId !== userId) return NextResponse.json({ error: "无权删除" }, { status: 403 });

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
