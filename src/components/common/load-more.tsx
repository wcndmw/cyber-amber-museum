"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export function LoadMore({ onLoadMore, hasMore, loading }: LoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-8">
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={loading}
        className="border-border/30 text-muted-foreground hover:text-foreground"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            加载中...
          </>
        ) : (
          "加载更多"
        )}
      </Button>
    </div>
  );
}
