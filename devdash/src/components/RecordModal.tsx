/**
 * Shared modal wrapper used by Users, MailingList, and Partners.
 *
 * Provides consistent chrome (header, info grid, editable zone, footer)
 * while each page passes its own field list, editable content, and actions.
 */
import { useEffect } from "react";
import { X } from "lucide-react";

export interface InfoField {
  label: string;
  value: React.ReactNode;
  wide?: boolean; // spans full width in the grid
}

interface RecordModalProps {
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  infoFields: InfoField[];
  /** Editable section rendered between info grid and footer */
  children?: React.ReactNode;
  /** Left slot: destructive actions. Right slot: primary actions. */
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  onClose: () => void;
}

export function RecordModal({
  icon: Icon,
  iconColor = "text-blue-400",
  title,
  subtitle,
  badge,
  infoFields,
  children,
  footerLeft,
  footerRight,
  onClose,
}: RecordModalProps) {
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const hasFooter = footerLeft || footerRight;

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-mono font-semibold text-white">{title}</h2>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Info grid */}
          {infoFields.length > 0 && (
            <div className="px-6 py-5 border-b border-slate-800/60">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {infoFields.map(({ label, value, wide }) => (
                  <div key={label} className={wide ? "col-span-2" : ""}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <div className="text-sm font-mono text-slate-300 break-all">
                      {value ?? <span className="text-slate-700">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editable / custom content */}
          {children && (
            <div className="px-6 py-5 space-y-4">
              {children}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        {hasFooter && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">{footerLeft}</div>
            <div className="flex items-center gap-2">{footerRight}</div>
          </div>
        )}
      </div>
    </div>
  );
}
