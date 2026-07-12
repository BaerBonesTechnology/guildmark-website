/** Inline superscript citation link to the sources footer. */
export function Cite({ n }: { n: number }) {
  return (
    <a
      href="#sources"
      className="text-muted-foreground text-xs  align-super ml-0.5 transition-colors"
    >
      [{n}]
    </a>
  );
}
