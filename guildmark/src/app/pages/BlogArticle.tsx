/**
 * Blog article — renders a single post by slug.
 *
 * Article bodies are keyed by slug in ARTICLE_BODY. The market-research post
 * renders the existing InsightPage report; future posts add their JSX here.
 */

import { useParams, Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { InsightPage } from "./Insights";
import { POSTS, BlogShell } from "./Blog";

const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Barlow Condensed', sans-serif";

const ARTICLE_BODY: Record<string, React.ReactNode> = {
  "it-hardware-lifecycle-gap": <InsightPage inDrawer />,
};

export function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <BlogShell backTo="/blog" backLabel="Back to blog">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: BODY }}>Post not found.</p>
          <Link to="/blog" className="text-xs font-mono text-primary hover:underline" style={{ fontFamily: MONO }}>
            ← Back to blog
          </Link>
        </div>
      </BlogShell>
    );
  }

  const body = ARTICLE_BODY[post.slug];

  return (
    <BlogShell backTo="/blog" backLabel="Back to blog">
      <article className="max-w-3xl mx-auto px-6 md:px-10 pt-14 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[9px] font-mono tracking-widest px-2 py-0.5"
            style={{ fontFamily: MONO, color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)", background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}>
            {post.category.toUpperCase()}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground" style={{ fontFamily: MONO }}>{post.date} · {post.readTime} read</span>
        </div>
        <h1 className="leading-[0.95] tracking-tight mb-4" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
          {post.title}
        </h1>
        <p className="text-base leading-relaxed" style={{ color: "var(--muted-foreground)", fontFamily: BODY }}>
          {post.excerpt}
        </p>
      </article>

      {body ?? (
        <div className="max-w-3xl mx-auto px-6 md:px-10 pb-16 text-sm text-muted-foreground" style={{ fontFamily: BODY }}>
          This post is coming soon.
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 border-t border-border">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors" style={{ fontFamily: MONO }}>
          More from the blog <ArrowRight size={12} />
        </Link>
      </div>
    </BlogShell>
  );
}
