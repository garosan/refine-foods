import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <SearchX className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Not found</h2>
        <p className="text-sm text-muted-foreground">
          The record you&rsquo;re looking for doesn&rsquo;t exist or may have been removed.
        </p>
      </div>
      <Button asChild>
        <a href="/dashboard">Back to dashboard</a>
      </Button>
    </div>
  );
}
