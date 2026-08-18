import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Presentation, UploadCloud } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  MAX_FILE_BYTES,
  buildFileName,
  getExtension,
} from "@/lib/submission-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopTalk Hub — Submit Your Presentation" },
      {
        name: "description",
        content:
          "Upload your ShopTalk college presentation quickly and securely in one place.",
      },
      { property: "og:title", content: "ShopTalk Hub — Submit Your Presentation" },
      {
        property: "og:description",
        content: "Upload your ShopTalk college presentation quickly and securely.",
      },
    ],
  }),
  component: Index,
});

type Success = {
  studentName: string;
  rollNumber: string;
  topic: string;
  fileName: string;
};

function Index() {
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Validates the picked file before we accept it. */
  function acceptFile(picked: File | undefined | null) {
    if (!picked) return;
    if (!getExtension(picked.name)) {
      setError("Please upload a PowerPoint file (.ppt or .pptx).");
      return;
    }
    if (picked.size > MAX_FILE_BYTES) {
      setError("That file is too large. Please keep it under 25 MB.");
      return;
    }
    setError(null);
    setFile(picked);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    // 1. Validate all fields
    if (!studentName.trim()) return setError("Please enter your full name.");
    if (!rollNumber.trim()) return setError("Please enter your roll number.");
    if (!topic.trim()) return setError("Please enter your presentation topic.");
    if (!file) return setError("Please select your presentation file.");
    const ext = getExtension(file.name);
    if (!ext) return setError("Please upload a PowerPoint file (.ppt or .pptx).");

    setError(null);
    setSubmitting(true);

    // 2. Generate the new filename: ROLLNO_NAME.pptx
    const fileName = buildFileName(rollNumber, studentName, ext);
    const filePath = `${Date.now()}_${fileName}`;

    try {
      // 3. Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from("presentations")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // 4. Save the submission details in the database
      const { error: dbError } = await supabase.from("submissions").insert({
        student_name: studentName.trim(),
        roll_number: rollNumber.trim(),
        topic: topic.trim(),
        file_name: fileName,
        file_path: filePath,
      });
      if (dbError) throw dbError;

      // 5. Show the success card
      setSuccess({
        studentName: studentName.trim(),
        rollNumber: rollNumber.trim(),
        topic: topic.trim(),
        fileName,
      });
    } catch {
      setError("Sorry, we couldn't submit your presentation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStudentName("");
    setRollNumber("");
    setTopic("");
    setFile(null);
    setSuccess(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-12">
        {/* Hero */}
        <section className="animate-rise text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Presentation className="size-7" />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            ShopTalk Hub
          </h1>
          <p className="mt-2 text-lg font-medium text-foreground/80">
            Submit Your ShopTalk Presentation
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Upload your presentation quickly and securely in one place.
          </p>
        </section>

        {/* Form or success card */}
        <section className="animate-rise card-surface mt-10 p-6 sm:p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto size-10 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">🎉 Submission Successful!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your ShopTalk presentation has been submitted successfully.
              </p>

              <dl className="mt-6 space-y-2 rounded-xl bg-secondary p-4 text-left text-sm">
                <Row label="Name" value={success.studentName} />
                <Row label="Roll No." value={success.rollNumber} />
                <Row label="Topic" value={success.topic} />
                <Row label="File" value={success.fileName} />
              </dl>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button onClick={reset}>Submit Another Presentation</Button>
                <Button asChild variant="outline">
                  <Link to="/submissions">View Submissions</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="name">Student Name</Label>
                <Input
                  id="name"
                  value={studentName}
                  maxLength={80}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roll">Roll Number</Label>
                <Input
                  id="roll"
                  value={rollNumber}
                  maxLength={30}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter your roll number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  maxLength={120}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your presentation topic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Presentation</Label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    acceptFile(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => inputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
                    dragging ? "border-primary bg-accent" : "border-input hover:bg-secondary"
                  }`}
                >
                  <UploadCloud className="size-6 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Drag &amp; Drop your PPT here</p>
                  <p className="text-xs text-muted-foreground">or</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium">
                    <FileUp className="size-3.5" /> Browse Files
                  </span>
                  <input
                    ref={inputRef}
                    id="file"
                    type="file"
                    accept=".ppt,.pptx"
                    className="hidden"
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                  />
                </div>
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{file.name}</span>
                  </p>
                )}
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? "Submitting…" : "Submit Presentation"}
              </Button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium break-all">{value}</dd>
    </div>
  );
}
