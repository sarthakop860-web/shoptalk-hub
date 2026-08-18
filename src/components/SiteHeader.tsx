import { Link } from "@tanstack/react-router";
import { Presentation } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

/** Minimal shared header with the app name and two nav links. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Presentation className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">ShopTalk Hub</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/admin"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
