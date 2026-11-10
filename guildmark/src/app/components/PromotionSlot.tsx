import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../config";
export type Promotion = {
  title: string;
  excerpt?: string;
  cover_url?: string;
  cover_alt?: string;
  placement?: string;
  cta_label?: string;
  target_url?: string;
  disclosure?: string;
  sponsor?: string;
};
function safeTarget(value: string | undefined) {
  if (!value || /[\\\s]/.test(value)) return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const u = new URL(value);
    if (u.protocol === "https:" && !u.username && !u.password) return value;
  } catch {}
  return undefined;
}
export function PromotionCreative({ promotion: p }: { promotion: Promotion }) {
  const href = safeTarget(p.target_url);
  return (
    <aside
      className={`gm-promotion ${p.placement === "marketplace-native" ? "gm-promotion-native" : ""}`}
      aria-label={
        p.disclosure === "sponsored"
          ? "Sponsored content"
          : "GuildMark announcement"
      }
    >
      {p.cover_url && (
        <img src={p.cover_url} alt={p.cover_alt || ""} loading="lazy" />
      )}
      <div>
        <p className="gm-promotion-label">
          {p.disclosure === "sponsored"
            ? `Sponsored · ${p.sponsor || "Sponsor"}`
            : "From GuildMark"}
        </p>
        <h2>{p.title || "Your headline"}</h2>
        {p.excerpt && <p>{p.excerpt}</p>}
        {href && p.cta_label && (
          <a
            className="gm-text-link"
            href={href}
            rel={
              p.disclosure === "sponsored" ? "sponsored noopener" : undefined
            }
          >
            {p.cta_label} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </aside>
  );
}
export function PromotionSlot({ placement }: { placement: string }) {
  const { data } = useQuery({
    queryKey: ["promotion", placement],
    queryFn: async () => {
      const r = await fetch(`${apiUrl}/content/promotions/${placement}`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error("Placement unavailable");
      return r.json() as Promise<{ promotion: Promotion | null }>;
    },
    retry: false,
    staleTime: 0,
    refetchInterval: 60000,
  });
  return data?.promotion ? (
    <PromotionCreative promotion={data.promotion} />
  ) : null;
}
