import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../config";
import type { ContentKind } from "../lib/contentKinds";
import type { PublishedPost } from "./usePublishedBlog";
export type PublicKind = Exclude<ContentKind, "blog" | "promotion">;
async function get<T>(kind: PublicKind, path = ""): Promise<T> {
  const response = await fetch(`${apiUrl}/content/entries/${kind}${path}`, {
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      response.status === 404
        ? "This content is not available."
        : "Content is temporarily unavailable. Please try again.",
    );
  return response.json();
}
export function useContentList(kind: PublicKind) {
  return useQuery({
    queryKey: ["published-content", kind],
    staleTime: 0,
    queryFn: async () => {
      let posts: PublishedPost[] = [],
        cursor: string | null = null;
      do {
        const page: { posts: PublishedPost[]; next_cursor: string | null } =
          await get(
            kind,
            cursor ? `?cursor=${encodeURIComponent(cursor)}` : "",
          );
        posts = posts.concat(page.posts);
        cursor = page.next_cursor;
      } while (cursor);
      return posts.sort((a, b) => a.title.localeCompare(b.title));
    },
  });
}
export function useContentEntry(kind: PublicKind, slug: string) {
  return useQuery({
    queryKey: ["published-content", kind, slug],
    staleTime: 0,
    retry: false,
    queryFn: () => get<PublishedPost>(kind, `/${encodeURIComponent(slug)}`),
  });
}
