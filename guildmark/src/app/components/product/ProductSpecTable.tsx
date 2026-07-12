/** PDP full specifications table. */
import { MONO } from "../../constants/typography";

export function ProductSpecTable({ specRows }: { specRows: [string, string][] }) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="px-4 py-3 border-b border-border">
        <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Specifications</span>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {specRows.map(([label, value], ndx) => (
            <tr key={label} style={{ background: ndx % 2 === 0 ? "transparent" : "var(--secondary)" }}>
              <td className="py-2 px-4 w-2/5 align-top text-[11px] tracking-wide uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</td>
              <td className="py-2 px-4">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
