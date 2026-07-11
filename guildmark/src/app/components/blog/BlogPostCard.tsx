/** A single post preview card, linking to the full article. */
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "../../lib/blog";

interface BlogPostCardProps {
  featured?: boolean;
  post: BlogPost;
}

export function BlogPostCard({ featured = false, post }: BlogPostCardProps) {
  return (
    <Link to={`/blog/${post.slug}`}
      className={`group flex flex-col bg-card border border-border hover:border-primary transition-colors ${featured ? "md:flex-row" : ""}`}>
      <div className={`p-6 flex flex-col flex-1 ${featured ? "md:p-10" : ""}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono tracking-widest px-2 py-0.5 text-primary border border-primary/30 bg-primary/10">
            {post.category.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-muted-foreground">{post.readTime} read</span>
        </div>
        <h2 className={`font-display font-bold leading-snug mb-3 group-hover:text-primary transition-colors ${featured ? "text-3xl" : "text-lg"}`}>
          {post.title}
        </h2>
        <p className="text-sm font-body leading-relaxed text-muted-foreground flex-1 mb-5">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">{post.date}</span>
          <span className="flex items-center gap-1 text-xs font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </Link>
  );
}
