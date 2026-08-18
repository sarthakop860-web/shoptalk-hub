import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/submission-utils";

export const Route = createFileRoute("/submissions")({
  head: () => ({
    meta: [
      { title: "Submitted Presentations — ShopTalk Hub" },
      {
        name: "description",
        content: "Browse and download the ShopTalk presentations submitted by students.",
      },
      { property: "og:title", content: "Submitted Presentations — ShopTalk Hub" },
      {
        property: "og:description",
        content: "Browse and download submitted ShopTalk presentations.",
      },
    ],
  }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const [search, setSearch] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Simple search across name, roll number and topic.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((s) =>
      [s.student_name, s.roll_number, s.topic].some((v) => v.toLowerCase().includes(q)),
    );
  }, [data, search]);

  /** Downloads the stored file from storage. */
  async function download(filePath: string, fileName: string) {
    setDownloadError(null);
    const { data, error } = await supabase.storage.from("presentations").download(filePath);
    if (error || !data) {
      setDownloadError("This file couldn't be downloaded. It may have been removed.");
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-12">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Submitted Presentations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          All ShopTalk presentations submitted so far.
        </p>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions..."
            className="pl-9"
          />
        </div>

        {downloadError && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {downloadError}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading submissions…</p>}
          {isError && (
            <p className="text-sm text-destructive">
              We couldn't load the submissions. Please refresh and try again.
            </p>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No submissions found yet.</p>
          )}

          {filtered.map((s) => (
            <article
              key={s.id}
              className="card-surface flex flex-col gap-4 p-5 transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h2 className="font-semibold">{s.student_name}</h2>
                <p className="text-sm text-muted-foreground">Roll No: {s.roll_number}</p>
                <p className="mt-2 text-sm">{s.topic}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="size-3.5 shrink-0" />
                  <span className="break-all">{s.file_name}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(s.submitted_at)}
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => download(s.file_path, s.file_name)}
              >
                <Download className="size-4" /> Download
              </Button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
