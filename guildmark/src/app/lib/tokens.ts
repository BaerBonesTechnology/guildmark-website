/**
 * GuildMark design tokens — JavaScript/TypeScript constants.
 *
 * Use these when a library cannot read CSS variables directly
 * (e.g. Recharts color props, canvas drawing, PDF generation).
 *
 * For all standard React/CSS contexts, prefer the CSS variables
 * defined in src/styles/theme.css via Tailwind utilities instead:
 *
 *   ✅  className="text-brand-primary bg-brand-subtle"
 *   ❌  style={{ color: brand.primary }}   ← only use when CSS vars unavailable
 */

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export const brand = {
  /** Primary brand blue — interactive elements, CTAs, active states */
  primary:   '#3B82F6',
  /** Hover state for brand-colored interactive elements */
  hover:     '#2563EB',
  /** Light-mode tinted background for icon containers and highlights */
  subtle:    'rgba(59, 130, 246, 0.10)',
  /** Light-mode border for brand-tinted areas */
  border:    'rgba(59, 130, 246, 0.20)',
  foreground: '#FFFFFF',
} as const;

// ---------------------------------------------------------------------------
// Condition grades
// ---------------------------------------------------------------------------

export const grades = {
  A: {
    bg:         '#3B82F6',
    text:       '#1D4ED8',
    subtle:     '#EFF6FF',
    foreground: '#FFFFFF',
    label:      'Excellent',
  },
  B: {
    bg:         '#F59E0B',
    text:       '#92400E',
    subtle:     '#FFFBEB',
    foreground: '#FFFFFF',
    label:      'Good',
  },
  C: {
    bg:         '#EF4444',
    text:       '#991B1B',
    subtle:     '#FEF2F2',
    foreground: '#FFFFFF',
    label:      'Fair',
  },
} as const;

export type ConditionGrade = keyof typeof grades;

// ---------------------------------------------------------------------------
// GM Pro (AMPS) accent palette
// ---------------------------------------------------------------------------

export const gmPro = {
  accent:           '#7C3AED',
  accentForeground: '#FFFFFF',
  highlight:        '#8B5CF6',
  /** Gradient string — always accent → highlight, left to right */
  gradient:         'linear-gradient(to right, #7C3AED, #8B5CF6)',
} as const;

// ---------------------------------------------------------------------------
// Chart series colors
// ---------------------------------------------------------------------------

/**
 * Ordered series colors for data visualizations.
 * Purple ramp for fleet/portfolio charts; brand blue for reference lines.
 *
 * Usage:
 *   <Line stroke={chartColors.series[0]} />
 *   <ReferenceLine stroke={chartColors.reference} />
 */
export const chartColors = {
  series: [
    '#8B5CF6', // series 1 — primary (portfolio value)
    '#A78BFA', // series 2
    '#C4B5FD', // series 3
    '#DDD6FE', // series 4
  ],
  /** Brand blue — used for reference lines (book value, target) */
  reference: '#3B82F6',
  /** Positive delta — upward trend */
  positive:  '#10B981',
  /** Negative delta / depreciation */
  negative:  '#EF4444',
  /** Neutral / forecast */
  neutral:   '#94A3B8',
} as const;

// ---------------------------------------------------------------------------
// Semantic colors (for chart tooltips, alert icons, etc.)
// ---------------------------------------------------------------------------

export const semantic = {
  success:     '#10B981',
  warning:     '#F59E0B',
  danger:      '#EF4444',
  info:        '#3B82F6',
} as const;
