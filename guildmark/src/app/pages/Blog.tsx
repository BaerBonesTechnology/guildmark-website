/** Blog — post list. Content is loaded from markdown via the blog data layer. */
import { BlogPostCard } from "../components/blog/BlogPostCard";
import { BlogShell } from "../components/blog/BlogShell";
import { blogPosts } from "../lib/blog";

export function Blog() {
  const [featured, ...rest] = blogPosts;

  return (
    <BlogShell>
      <div className="max-w-screen-2xl mx-auto px-8 md:px-20 py-16">
        <div className="mb-12">
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3">
            GuildMark Blog
          </p>
          <h1 className="font-display font-extrabold tracking-tight leading-[0.93] text-5xl md:text-7xl">
            Market intelligence.<br />Fleet strategy.<br />IT asset recovery.
          </h1>
        </div>

        {featured && (
          <div className="mb-6">
            <BlogPostCard post={featured} featured />
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {rest.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </BlogShell>
  );
}
