/** Inline form error message for pre-launch waitlist forms. */
import { BODY } from "../../constants/typography";

export function FormError({ msg }: { msg: string }) {
  return <p className="text-xs text-destructive" style={{ fontFamily: BODY }}>{msg}</p>;
}
