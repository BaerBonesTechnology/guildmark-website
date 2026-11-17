import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Search, ArrowRight } from "lucide-react";
import { BlogShell } from "../components/blog/BlogShell";
import { ArticleBody } from "../components/blog/ArticleBody";
import { contentKinds } from "../lib/contentKinds";
import {
  useContentList,
  useContentEntry,
  type PublicKind,
} from "../hooks/usePublishedContent";

function ContentNav() {
  return (
    <nav aria-label="Content navigation" className="cms-public-nav">
      <Link to="/pages">Pages</Link>
      <Link to="/faqs">FAQs</Link>
      <Link to="/help">Help centre</Link>
      <Link to="/blog">Blog</Link>
    </nav>
  );
}
const descriptions = {
  page: "Explore GuildMark guides, information and resources.",
  faq: "Straightforward answers to common questions.",
  help: "Find a guide and get your next task done.",
};
export function ContentDirectory({ kind }: { kind: PublicKind }) {
  const config = contentKinds[kind],
    query = useContentList(kind),
    [search, setSearch] = useState("");
  const posts = (query.data ?? []).filter((p) =>
    `${p.title} ${p.excerpt} ${p.category} ${kind === "faq" ? p.body : ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <BlogShell sectionLabel={config.label}>
      <div className="cms-public-page">
        <ContentNav />
        <header className="cms-public-heading">
          <p className="cms-kicker">GuildMark resources</p>
          <h1>{kind === "help" ? "Help centre" : config.label}</h1>
          <p>{descriptions[kind]}</p>
        </header>
        <label className="cms-public-search">
          <span>Search {config.label.toLowerCase()}</span>
          <div>
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                kind === "faq"
                  ? "Search questions and answers"
                  : "Search by topic or title"
              }
            />
          </div>
        </label>
        {query.isLoading && <p role="status">Loading content…</p>}
        {query.isError && (
          <div role="alert">
            <p>{query.error.message}</p>
            <button onClick={() => query.refetch()} className="cms-text-link">
              Retry loading content
            </button>
          </div>
        )}
        {!query.isLoading && !query.isError && !posts.length && (
          <p role="status" className="cms-public-empty">
            {search
              ? "No matching content. Try another search."
              : "New content will appear here when it is published."}
          </p>
        )}
        {kind === "faq" ? (
          <div className="cms-faq-list">
            {posts.map((p) => (
              <details key={p.slug}>
                <summary>{p.title}</summary>
                <div>
                  <ArticleBody body={p.body} />
                  <Link
                    className="cms-text-link"
                    to={`${config.public}/${p.slug}`}
                  >
                    Link to this answer
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="cms-public-grid">
            {posts.map((p) => (
              <article key={p.slug}>
                <p className="cms-kicker">
                  {p.category ||
                    (kind === "help" ? "Help article" : "GuildMark")}
                </p>
                <h2>
                  <Link to={`${config.public}/${p.slug}`}>{p.title}</Link>
                </h2>
                {p.excerpt && <p>{p.excerpt}</p>}
                <Link
                  className="cms-text-link"
                  to={`${config.public}/${p.slug}`}
                >
                  Read {kind === "help" ? "guide" : "page"}
                  <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </BlogShell>
  );
}
export function ContentEntry({ kind }: { kind: PublicKind }) {
  const { slug = "" } = useParams(),
    config = contentKinds[kind],
    query = useContentEntry(kind, slug),
    post = query.data;
  useEffect(() => {
    if (!post) return;
    const old = document.title;
    document.title = post.seo_title || post.title;
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previous = meta?.content;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = post.seo_description || post.excerpt;
    return () => {
      document.title = old;
      if (previous !== undefined) meta!.content = previous;
      else meta!.remove();
    };
  }, [post]);
  return (
    <BlogShell
      sectionLabel={config.label}
      backTo={config.public}
      backLabel={`All ${config.label.toLowerCase()}`}
    >
      <div className="cms-public-page">
        <ContentNav />
        {query.isLoading ? (
          <p role="status">Loading content…</p>
        ) : !post ? (
          <div role="alert" className="cms-public-empty">
            <h1>{query.error?.message ?? "Content not found."}</h1>
            <Link className="cms-text-link" to={config.public}>
              Back to {config.label.toLowerCase()}
            </Link>
          </div>
        ) : (
          <article className="cms-public-article">
            <header className="cms-public-heading">
              {post.category && <p className="cms-kicker">{post.category}</p>}
              <h1>{post.title}</h1>
              {post.excerpt && <p>{post.excerpt}</p>}
              {kind === "help" && post.author && (
                <p className="cms-muted">By {post.author}</p>
              )}
            </header>
            {post.cover_url && (
              <img
                className="cms-cover"
                src={post.cover_url}
                alt={post.cover_alt ?? ""}
              />
            )}
            <ArticleBody body={post.body} />
            <div className="cms-public-return">
              <Link className="cms-text-link" to={config.public}>
                Back to {config.label.toLowerCase()}
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        )}
      </div>
    </BlogShell>
  );
}
