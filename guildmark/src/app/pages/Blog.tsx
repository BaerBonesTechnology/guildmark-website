/**
 * Blog — post list.
 *
 * Market research and other writing live here as individual posts. The blog
 * is content-driven off the POSTS array; add an entry here and its article
 * body in BlogArticle.tsx to publish. Currently one post: the IT hardware
 * lifecycle-gap market research report (rendered from InsightPage).
 */

import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import logoLong from "../../logo-long.svg";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

export interface Post {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}

/** Published posts, newest first. */
export const POSTS: Post[] = [
  {
    slug: "it-hardware-lifecycle-gap",
    category: "Market Research",
    title: "Capitalizing on the IT Hardware Lifecycle Gap",
    excerpt:
      "The secondary B2B hardware market is driven by predictable refresh cycles, unspent corporate budgets, and a real technology gap between large enterprises and small businesses. The data behind the GuildMark opportunity.",
    date: "2025–2026",
    readTime: "12 min",
  },
];

/** Shared chrome (header + footer) for the blog list and article pages. */
export function BlogShell({
  children,
  backTo = "/",
  backLabel = "Back to home",
}: {
  children: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <header className="border-b border-border sticky top-0 z-50" style={{ background: "var(--background)", backdropFilter: "blur(8px)" }}>
        <div className="px-8 md:px-20 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link to="/"><img src={logoLong} className="h-6" alt="GuildMark" /></Link>
            <span className="text-[9px] font-mono tracking-[0.15em] text-muted-foreground border border-border px-2 py-0.5 hidden sm:block" style={{ fontFamily: MONO }}>
              BLOG
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to={backTo}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: BODY }}>
              <ArrowLeft size={14} />
              {backLabel}
            </Link>
            <button onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="max-w-[1600px] mx-auto px-8 md:px-20 py-8 flex items-center justify-between gap-6">
          <p className="text-[11px] font-mono text-muted-foreground" style={{ fontFamily: MONO }}>
            © {new Date().getFullYear()} Baerhous Media Group, LLC — GuildMark™
          </p>
          <div className="flex gap-5">
            <a href="/compliance/privacy-policy" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>Privacy Policy</a>
            <a href="/compliance/terms" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link to={`/blog/${post.slug}`}
      className={`group flex flex-col border border-border hover:border-primary transition-colors ${featured ? "md:flex-row" : ""}`}
      style={{ background: "var(--card)" }}>
      <div className={`p-6 flex flex-col flex-1 ${featured ? "md:p-10" : ""}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[9px] font-mono tracking-widest px-2 py-0.5"
            style={{ fontFamily: MONO, color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)", background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}>
            {post.category.toUpperCase()}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground" style={{ fontFamily: MONO }}>{post.readTime} read</span>
        </div>
        <h2 className={`leading-snug mb-3 group-hover:text-primary transition-colors ${featured ? "text-3xl" : "text-lg"}`}
          style={{ fontFamily: DISPLAY, fontWeight: 700 }}>
          {post.title}
        </h2>
        <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "var(--muted-foreground)", fontFamily: BODY }}>
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground" style={{ fontFamily: MONO }}>{post.date}</span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: MONO }}>
            Read <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function Blog() {
  const [featured, ...rest] = POSTS;

  return (
    <BlogShell>
      <div className="max-w-[1600px] mx-auto px-8 md:px-20 py-16">
        <div className="mb-12">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-3" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
            GuildMark Blog
          </p>
          <h1 className="leading-[0.93] tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(3rem, 5vw, 4.5rem)" }}>
            Market intelligence.<br />Fleet strategy.<br />IT asset recovery.
          </h1>
        </div>

        {featured && (
          <div className="mb-6">
            <PostCard post={featured} featured />
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px border border-border" style={{ background: "var(--border)" }}>
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </BlogShell>
  );
}
