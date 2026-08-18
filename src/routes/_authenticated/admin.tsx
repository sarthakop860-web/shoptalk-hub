import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, FileText, LogOut, Search, ShieldAlert, Trash2 } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/submission-utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — ShopTalk Hub" },
      {
        name: "description",
        content: "Admin panel to review, download and delete submitted ShopTalk presentations.",
      },
      { property: "og:title", content: "Admin Panel — ShopTalk Hub" },
      {
        property: "og:description",
        content: "Manage all submitted ShopTalk presentations in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submissions"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((s) =>
      [s.student_name, s.roll_number, s.topic].some((v) => v.toLowerCase().includes(q)),
    );
  }, [data, search]);

  async function download(filePath: string, fileName: string) {
    setMessage(null);
    const { data, error } = await supabase.storage.from("presentations").download(filePath);
    if (error || !data) {
      setMessage("This file couldn't be downloaded. It may have been removed.");
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function remove(id: string, filePath: string) {
    if (!window.confirm("Delete this submission and its file? This can't be undone.")) return;
    setMessage(null);
    setBusyId(id);
    try {
      await supabase.storage.from("presentations").remove([filePath]);
      const { error } = await supabase.from("submissions").delete().eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setMessage("Submission deleted.");
    } catch {
      setMessage("We couldn't delete that submission. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!roleLoading && isAdmin === false) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 pb-20 pt-20 text-center">
          <ShieldAlert className="mx-auto size-10 text-destructive" />
          <h1 className="mt-4 text-xl font-semibold">Not authorised</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account doesn't have admin access to the presentations.
          </p>
          <Button variant="outline" className="mt-6" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Admin Panel</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {data ? `${data.length} submission${data.length === 1 ? "" : "s"} received.` : "Manage all submitted presentations."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number or topic..."
            className="pl-9"
          />
        </div>

        {message && (
          <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {(roleLoading || isLoading) && (
            <p className="text-sm text-muted-foreground">Loading submissions…</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              We couldn't load the submissions. Please refresh and try again.
            </p>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No submissions found.</p>
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
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(s.submitted_at)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" onClick={() => download(s.file_path, s.file_name)}>
                  <Download className="size-4" /> Download
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={busyId === s.id}
                  onClick={() => remove(s.id, s.file_path)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
