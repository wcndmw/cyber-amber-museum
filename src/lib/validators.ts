import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(2, "用户名至少2个字符")
    .max(30, "用户名最多30个字符")
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, "用户名只能包含字母、数字、下划线和中文"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位").max(100),
});

export const postSchema = z.object({
  title: z.string().min(1, "请输入标题").max(100, "标题最多100个字符"),
  description: z.string().max(2000).optional(),
  gameName: z.string().max(100).optional(),
  mediaType: z.enum(["image", "video"]),
  mediaUrl: z.string().url(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "请输入评论内容").max(1000),
  parentId: z.string().uuid().optional(),
});

export const settingsSchema = z.object({
  username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
