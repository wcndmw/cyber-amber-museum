"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Upload,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Compass,
  Bell,
  Settings,
  Shield,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const role = (session?.user as unknown as Record<string, unknown> | undefined)?.role as
    | string
    | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-cyber-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 overflow-hidden rounded-lg">
            <img src="/logo.jpg" alt="赛博琥珀博物馆" className="h-full w-full object-cover" />
          </div>
          <span className="text-gradient-amber hidden sm:inline">
            赛博琥珀博物馆
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> 首页
          </Link>
          <Link href="/explore" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Compass className="h-3.5 w-3.5" /> 探索
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link
                href="/upload"
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-gold to-amber-light px-3 py-1.5 text-sm font-semibold text-cyber-bg transition-all hover:brightness-110"
              >
                <Upload className="h-3.5 w-3.5" /> 发布
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border/30 bg-secondary"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-border/20 bg-card py-1 shadow-xl">
                      <Link
                        href={`/user/${session.user.name}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" /> 个人主页
                      </Link>
                      <Link
                        href="/user/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" /> 设置
                      </Link>
                      <Link
                        href="/user/notifications"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bell className="h-4 w-4" /> 通知
                      </Link>
                      {role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" /> 管理
                        </Link>
                      )}
                      <hr className="my-1 border-border/20" />
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> 退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="amber-btn rounded-lg px-4 py-1.5 text-sm"
            >
              登录
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="border-t border-border/20 bg-card md:hidden">
          <div className="flex flex-col p-4 gap-3">
            <Link href="/" className="flex items-center gap-2 text-sm" onClick={() => setMenuOpen(false)}>
              <Home className="h-4 w-4" /> 首页
            </Link>
            <Link href="/explore" className="flex items-center gap-2 text-sm" onClick={() => setMenuOpen(false)}>
              <Compass className="h-4 w-4" /> 探索
            </Link>
            {session?.user && (
              <Link href="/upload" className="flex items-center gap-2 text-sm text-amber-gold" onClick={() => setMenuOpen(false)}>
                <Upload className="h-4 w-4" /> 发布作品
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
