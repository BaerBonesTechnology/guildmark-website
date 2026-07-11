/** Blog article — renders one markdown post by slug. */
import type { Components } from "react-markdown";
import { Link, useParams } from "react-router";
import { ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { BlogShell } from "../components/blog/BlogShell";
import { InsightPage } from "./Insights";
import { findBlogPost } from "../lib/blog";

/**
 * Token-styled renderers for the markdown body (styling stays out of the View).
 * `<insight-report>` is a custom tag posts can embed to drop the interactive
 * market-research charts into markdown prose — HTML-in-markdown enabled by
 * rehypeRaw, mapped here to the React report component.
 */
const MARKDOWN_COMPONENTS = {
  a: ({ children, href }) => <a href={href} className="text-primary hover:underline">{children}</a>,
  h2: ({ children }) => <h2 className="font-display font-bold text-2xl mt-10 mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="font-display font-semibold text-xl mt-8 mb-2">{children}</h3>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  // Markdown parses `<insight-report>` as inline, so react-markdown wraps it in
  // a paragraph. The report is block-level, so unwrap the <p> in that case to
  // keep the DOM valid.
  p: ({ children, node }) => {
    const wrapsBlockEmbed = node?.children?.some(
      (child) => child.type === "element" && child.tagName === "insight-report",
    );
    if (wrapsBlockEmbed) return <>{children}</>;
    return <p className="font-body text-base leading-relaxed text-muted-foreground mb-5">{children}</p>;
  },
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-1.5 font-body text-muted-foreground">{children}</ul>,
  "insight-report": () => <InsightPage inDrawer />,
} as Components;

export function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const post = findBlogPost(slug);

  if (!post) {
    return (
      <BlogShell backTo="/blog" backLabel="Back to blog">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-sm font-body text-muted-foreground">Post not found.</p>
          <Link to="/blog" className="text-xs font-mono text-primary hover:underline">← Back to blog</Link>
        </div>
      </BlogShell>
    );
  }

  return (
    <BlogShell backTo="/blog" backLabel="Back to blog">
      <article className="mx-auto px-6 md:px-10 pt-14">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono tracking-widest px-2 py-0.5 text-primary border border-primary/30 bg-primary/10">
            {post.category.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-muted-foreground">{post.date} · {post.readTime} read · {post.author} </span>
        </div>
        <h1 className="font-display font-extrabold tracking-tight leading-[0.95] text-4xl md:text-6xl mb-4">
          {post.title}
        </h1>
        <p className="text-base font-body leading-relaxed text-muted-foreground">{post.excerpt}</p>
      </article>

      <div className="mx-auto px-6 md:px-10 pb-16">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={MARKDOWN_COMPONENTS}>
          {post.body}
        </ReactMarkdown>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 border-t border-border">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
          More from the blog <ArrowRight size={12} />
        </Link>
      </div>
    </BlogShell>
  );
}
