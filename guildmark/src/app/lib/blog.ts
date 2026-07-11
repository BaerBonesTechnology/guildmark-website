/**
 * Blog data layer (Model).
 *
 * Posts are authored as markdown files in `src/content/blog/*.md` with YAML
 * frontmatter. This module loads them at build time (Vite glob), parses the
 * frontmatter, and exposes the typed post list + a single-post lookup. The
 * View layer never reads markdown files directly — it consumes these.
 */

export interface BlogPost extends BlogPostMeta {
  body: string;
}

export interface BlogPostMeta {
  category: string;
  date: string;
  excerpt: string;
  readTime: string;
  author?: string;
  slug: string;
  title: string;
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const rawPosts = import.meta.glob("../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Every published post, newest first. */
export const blogPosts: BlogPost[] = Object.values(rawPosts)
  .map(parsePost)
  .sort((left, right) => right.date.localeCompare(left.date));

/** Look up a single post by its slug, or `undefined` when none matches. */
export function findBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Parse one raw markdown file (frontmatter + body) into a typed post. */
function parsePost(content: string): BlogPost {
  const match = FRONTMATTER_PATTERN.exec(content.trim());
  if (!match) {
    throw new Error("Blog post is missing YAML frontmatter");
  }

  const [, frontmatter, body] = match;
  const meta: Record<string, string> = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const separatorNdx = line.indexOf(":");
    if (separatorNdx === -1) continue;
    const name = line.slice(0, separatorNdx).trim();
    const value = line.slice(separatorNdx + 1).trim().replace(/^["']|["']$/g, "");
    meta[name] = value;
  }

  return {
    body: body.trim(),
    category: meta.category ?? "",
    date: meta.date ?? "",
    excerpt: meta.excerpt ?? "",
    readTime: meta.readTime ?? "",
    author: meta.author ?? "",
    slug: meta.slug ?? "",
    title: meta.title ?? "",
  };
}
