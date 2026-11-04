export function OrderPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="gm-order-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
