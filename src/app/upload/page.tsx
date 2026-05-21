"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/utils";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameName, setGameName] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;

    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("不支持的文件类型");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("文件大小不能超过 50MB");
      return;
    }

    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file || !title.trim()) return;
    setUploading(true);
    setError("");

    try {
      // Get presigned Supabase upload URL
      const presignRes = await fetch(
        `/api/upload/presign?file=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`
      );
      const { uploadUrl, publicUrl, error: presignError } = await presignRes.json();
      if (presignError) throw new Error(presignError);

      // Upload to Supabase Storage
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      // Create post
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user?.id || "",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          gameName: gameName.trim() || undefined,
          mediaType: file.type.startsWith("video/") ? "video" : "image",
          mediaUrl: publicUrl || preview,
          tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("发布失败");
      }
    } catch {
      setError("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">请先登录再发布作品</p>
      </div>
    );
  }

  const isVideo = file?.type.startsWith("video/");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">发布作品</h1>
      <p className="text-sm text-muted-foreground mb-6">分享你的游戏精彩瞬间</p>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          preview
            ? "border-amber-gold/30 bg-card"
            : "border-border/40 bg-card/30 hover:border-amber-gold/20"
        }`}
      >
        {preview ? (
          <div className="relative">
            {isVideo ? (
              <video src={preview} controls className="mx-auto max-h-64 rounded-lg" />
            ) : (
              <img src={preview} alt="preview" className="mx-auto max-h-64 rounded-lg object-contain" />
            )}
            <button
              onClick={() => { setFile(null); setPreview(""); }}
              className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Upload className="h-10 w-10" />
              <p className="text-sm font-medium">拖拽文件到此处或点击上传</p>
              <p className="text-xs">支持 JPG/PNG/WebP/GIF/MP4/WebM，最大 50MB</p>
            </div>
          </>
        )}
      </div>

      {/* Form */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">标题 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给作品起个名字..."
            className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none focus:border-amber-gold/50"
            maxLength={100}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">游戏名称</label>
          <input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="如：Red Dead Redemption 2"
            className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none focus:border-amber-gold/50"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="分享你的创作故事..."
            className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none resize-none focus:border-amber-gold/50 h-24"
            maxLength={2000}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">标签（逗号分隔）</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="风景, 开放世界, 摄影"
            className="w-full rounded-lg border border-border/30 bg-secondary px-3 py-2 text-sm outline-none focus:border-amber-gold/50"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button
          onClick={handleSubmit}
          className="amber-btn w-full"
          disabled={!file || !title.trim() || uploading}
        >
          {uploading ? "发布中..." : "发布作品"}
        </Button>
      </div>
    </div>
  );
}
