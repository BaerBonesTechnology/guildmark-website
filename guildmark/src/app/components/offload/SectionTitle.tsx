/** Card section title used across the offload workflow. */
import { BODY } from "../../constants/typography";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium" style={{ fontFamily: BODY }}>{children}</p>;
}
