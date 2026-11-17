/** Numbered "how it works" step in the Signup story panel. */
export function Step({ num, title, body }: { body: string; num: number; title: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs  font-bold shrink-0 mt-0.5">
        {num}
      </div>
      <div>
        <p className="text-sm font-semibold ">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
      </div>
    </div>
  );
}
