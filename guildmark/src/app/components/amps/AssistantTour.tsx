import { useRef, useState } from "react";
import { dismissAssistantTour, shouldShowAssistantTour } from "../../services/assistantTour";

const steps = [
  { title: "Review your inventory", text: "Check the records below, then select up to five laptop records. Each record can contain multiple devices." },
  { title: "Estimate selected assets", text: "Choose Estimate selected assets when you’re ready. Complete purchase dates and hardware specifications help produce an estimate; fresh successful estimates use credits." },
  { title: "Prepare listing previews", text: "Review a suggested title, description and price for the same selection. Previews do not create or publish listings." },
];
const button = "rounded border border-border px-3 py-2 text-xs hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
function storage() { try { return window.localStorage; } catch { return null; } }

export function AssistantTour({ ownerKey }: { ownerKey: string | null }) {
  const [open, setOpen] = useState(() => shouldShowAssistantTour(ownerKey, storage()));
  const [step, setStep] = useState(0);
  const replay = useRef<HTMLButtonElement>(null);
  function close() { dismissAssistantTour(ownerKey, storage()); setOpen(false); replay.current?.focus(); }
  return <div className="space-y-3">
    <div className="flex justify-end"><button ref={replay} type="button" className="rounded px-2 py-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary" aria-expanded={open} aria-controls="amps-assistant-tour" onClick={() => { setStep(0); setOpen(true); }}>Take a tour</button></div>
    {open && <section id="amps-assistant-tour" aria-label="Optional assistant tour" className="rounded-lg border border-amps-accent/40 bg-card p-5" onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
      <div className="flex items-start justify-between gap-4"><div aria-live="polite" aria-atomic="true"><p className="mb-2 text-xs text-muted-foreground">Quick tour · Step {step + 1} of {steps.length}</p><h2 className="text-base font-semibold">{steps[step].title}</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{steps[step].text}</p></div><button type="button" className={button} onClick={close}>Skip tour</button></div>
      <div className="mt-4 flex gap-2">{step > 0 && <button type="button" className={button} onClick={() => setStep(step - 1)}>Back</button>}<button type="button" className={`${button} bg-amps-accent text-amps-accent-foreground`} onClick={() => step === steps.length - 1 ? close() : setStep(step + 1)}>{step === steps.length - 1 ? "Done" : "Next"}</button></div>
    </section>}
  </div>;
}
