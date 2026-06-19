interface SpecPillProps {
  children: React.ReactNode;
}

export function SpecPill({ children }: SpecPillProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs ">
      {children}
    </span>
  );
}
