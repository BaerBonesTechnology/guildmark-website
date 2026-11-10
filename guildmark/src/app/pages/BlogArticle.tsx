import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight } from "lucide-react";
import { BlogShell } from "../components/blog/BlogShell";
import { ArticleBody } from "../components/blog/ArticleBody";
import { usePublishedPost } from "../hooks/usePublishedBlog";
export function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>(),
    query = usePublishedPost(slug),
    post = query.data;
  useEffect(() => {
    if (!post) return;
    const title = document.title;
    document.title = post.seo_title || post.title;
    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previous = description?.content;
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = post.seo_description || post.excerpt;
    return () => {
      document.title = title;
      if (previous !== undefined) description!.content = previous;
      else description!.remove();
    };
  }, [post]);
  return (
    <BlogShell backTo="/blog" backLabel="Back to blog">
      {query.isLoading ? (
        <p role="status" className="p-10">
          Loading article…
        </p>
      ) : !post ? (
        <div className="p-10" role="alert">
          <p>{query.error?.message ?? "Article not found."}</p>
          <Link to="/blog">Back to blog</Link>
        </div>
      ) : (
        <>
          <article className="max-w-4xl mx-auto px-6 md:px-10 py-14">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {post.category} · {post.date} · {post.readTime} read
            </p>
            <h1 className="font-display font-extrabold tracking-tight leading-tight text-4xl md:text-6xl mt-5 mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground">{post.excerpt}</p>
            <p className="text-sm text-muted-foreground mt-4">
              By {post.author}
            </p>
            {post.cover_url && (
              <img
                className="cms-cover"
                src={post.cover_url}
                alt={post.cover_alt ?? ""}
              />
            )}
            <ArticleBody body={post.body} />
          </article>
          <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 border-t border-border">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-primary"
            >
              More from the blog
              <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </BlogShell>
  );
}
