import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json({ error: "缺少文件名" }, { status: 400 });
    }

    const ext = fileName.split(".").pop() || "jpg";
    const uniqueName = `${uuid()}.${ext}`;
    const filePath = `uploads/${uniqueName}`;

    const { data, error } = await supabase.storage
      .from("media")
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error("Supabase presign error:", error);
      return NextResponse.json({ error: "生成上传链接失败" }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${filePath}`;

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      publicUrl,
      filePath,
    });
  } catch (error) {
    console.error("GET /api/upload/presign error:", error);
    return NextResponse.json({ error: "获取上传链接失败" }, { status: 500 });
  }
}
