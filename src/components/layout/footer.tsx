import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/20 bg-cyber-bg/60">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 overflow-hidden rounded">
              <img src="/logo.jpg" alt="赛博琥珀博物馆" className="h-full w-full object-cover" />
            </div>
            <span className="text-foreground font-semibold">赛博琥珀博物馆</span>
          </div>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> by
            Game Lovers · {new Date().getFullYear()}
          </p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">首页</Link>
            <Link href="/explore" className="hover:text-foreground transition-colors">探索</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
