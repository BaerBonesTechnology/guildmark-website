interface Props {
  icon: React.ElementType;
  label: string;
  value: string;
}
export function OrderDetailRow({ icon: Icon, label, value }: Props) {
  return (
    <div className="gm-order-detail-row">
      <dt>
        <Icon size={14} aria-hidden="true" />
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
