/** Loading placeholder mirroring a marketplace listing card. */
export function ListingCardSkeleton() {
  return (
    <div className="gm-listing gm-listing-skeleton" aria-hidden="true">
      <div className="gm-listing-image" />
      <div className="gm-skeleton-body">
        <span className="gm-skeleton-line" style={{ width: "40%" }} />
        <span className="gm-skeleton-line" style={{ width: "85%", height: 15 }} />
        <span className="gm-skeleton-line" style={{ width: "55%" }} />
        <span className="gm-skeleton-line is-price" />
      </div>
    </div>
  );
}
