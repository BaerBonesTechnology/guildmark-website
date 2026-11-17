import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../config";
import type { BlogPost } from "../lib/blog";
export type PublishedPost = BlogPost & {
  cover_url?: string;
  cover_alt?: string;
  seo_title?: string;
  seo_description?: string;
};
async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${apiUrl}/content/blog${path}`, { cache: "no-store" });
  if (!r.ok)
    throw new Error(
      r.status === 404
        ? "Article not found."
        : "The blog is temporarily unavailable. Please try again.",
    );
  return r.json();
}
export function usePublishedPosts() {
  return useQuery({
    queryKey: ["public-blog"],
    staleTime: 0,
    queryFn: async () => {
      let posts: PublishedPost[] = [],
        cursor: string | null = null;
      do {
        const page: { posts: PublishedPost[]; next_cursor: string | null } =
          await get(cursor ? `?cursor=${encodeURIComponent(cursor)}` : "");
        posts = posts.concat(page.posts);
        cursor = page.next_cursor;
      } while (cursor);
      return posts.sort((a, b) => b.date.localeCompare(a.date));
    },
  });
}
export function usePublishedPost(slug: string) {
  return useQuery({
    queryKey: ["public-blog", slug],
    staleTime: 0,
    retry: false,
    queryFn: () => get<PublishedPost>(`/${encodeURIComponent(slug)}`),
  });
}
