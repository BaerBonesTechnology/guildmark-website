# GuildMark Frontend — Engineering Standards

This is a production business codebase that multiple engineers own. Code is read
far more often than it is written, so **readability and consistency win over
cleverness**. Every rule below exists to make the code predictable: a new
engineer should be able to open any file and know where things are.

The stack is **React 19 + TypeScript + Vite + Tailwind**, organised as
**MVVM** with **SOLID** principles.

---

## 1. Architecture — MVVM

Three layers, each with a single responsibility. Dependencies point **downward
only**: View → ViewModel → Model/Services. Never the reverse.

| Layer | Lives in | Responsibility | May contain |
| --- | --- | --- | --- |
| **Model** | `src/app/models/`, `src/app/lib/api.ts` | Data shapes + data access | types, DTOs, API calls |
| **Services / Logic** | `src/app/services/`, `src/app/lib/` | Business rules, pure logic | pure functions, calculations, formatting |
| **ViewModel** | `src/app/viewmodels/` (a hook per view) | State + orchestration | `useState`, queries, calls into services |
| **View** | `src/app/pages/`, `src/app/components/` | Presentation only | JSX, layout, calls into the ViewModel |

**The View layer contains no business logic.** A component may only:

- render markup,
- read values from its ViewModel hook,
- call handlers exposed by its ViewModel.

Anything that computes, decides, transforms, or fetches belongs in a
ViewModel or a Service. If you find a `.map`/`.filter`/`.reduce`, a price
calculation, a status derivation, or an `if` that encodes a business rule
inside JSX, extract it.

```tsx
// ❌ logic in the View
function OfferCard({ offer }) {
  const diffPct = ((offer.offerPrice - offer.listedPrice) / offer.listedPrice) * 100;
  const canRespond = offer.status === "pending" && offer.expiresAt > Date.now();
  return <div>{diffPct.toFixed(0)}% {canRespond && <button>Respond</button>}</div>;
}

// ✅ logic in the ViewModel / service, View just renders
function OfferCard({ offer }: { offer: OfferView }) {
  const { differencePercent, canRespond } = useOfferCardViewModel(offer);
  return <div>{differencePercent} {canRespond && <button>Respond</button>}</div>;
}
```

### SOLID, applied here

- **Single responsibility** — one reason to change per file (one component, one
  service, one ViewModel).
- **Open/closed** — extend via new components/services, not by adding branches to
  existing ones.
- **Liskov** — components accepting an interface must work for every
  implementation of it.
- **Interface segregation** — props/interfaces stay small and focused; no
  "god props".
- **Dependency inversion** — Views depend on ViewModel/Service *abstractions*
  (hook signatures, function types), not concrete data-fetching details.

---

## 2. One class / component per file

- **Exactly one** exported React component (widget) or class per file.
- The file name matches the component/class name (`OfferCard.tsx` exports
  `OfferCard`).
- Small **private** presentational helpers used only by that component may stay
  in the same file **only if they are not exported** and are trivial. When in
  doubt, split.
- Shared helpers, types, and constants live in their own files.

---

## 3. Styling — Tailwind + CSS tokens

- Use **Tailwind utility classes** for layout and spacing. Tailwind is
  config-driven design, not magic values.
- **No inline `style={{}}` objects.** They mix styling into the View and hide
  raw values. Move them to Tailwind utilities or CSS classes.
- **No raw values in components** — every colour, size, radius, font, and shadow
  comes from a **CSS variable / theme token** (`theme.css`, `tailwind.config`).
  `#2d6ef0`, `14px`, or `'DM Sans'` must never appear in a component.
- Component-specific styling that Tailwind can't express goes in a co-located
  `*.css` file that only references tokens.

```tsx
// ❌  style={{ color: "#2d6ef0", fontFamily: "'DM Sans'", padding: 20 }}
// ✅  className="text-primary font-body p-5"   (font-body / p-5 defined via tokens)
```

---

## 4. Strings & content

- **No hardcoded user-facing strings.** All copy — labels, buttons, empty
  states, **SEO / meta tags** — goes through i18n (`react-i18next`), keyed in the
  locale resource files (`en`, `es`, `fr`). Components reference keys via `t()`.
- **No magic strings/numbers** in logic. Named constants live in a
  `*.constants.ts` file for the feature (or a shared `constants/` module).
  Enumerations use `as const` union types or enums, never bare literals.
- **Blog posts are markdown.** Author each post as a `*.md` file in
  `src/content/blog/` with YAML frontmatter (`slug`, `title`, `category`,
  `date`, `readTime`, `excerpt`). The blog list and article pages render from
  the markdown loader — never hardcode post bodies in `.tsx`.

---

## 5. Naming

- **Minimum four letters**, human-readable. `qty` → `quantity`, `btn` →
  `button`, `e` → `event`, `l` → `listing`.
- **Allowed exceptions:** `id`, and the loop index — prefer **`ndx`** over `i`.
- `camelCase` for variables and functions; `PascalCase` for components, classes,
  and types; `UPPER_SNAKE_CASE` for module-level constants.
- Booleans read as predicates: `isPending`, `hasCounter`, `canRespond`.

---

## 6. Ordering (readability)

**Top-level declarations in a file are alphabetical** within their kind
(imports grouped and sorted; then constants; then types; then the component/
class), except where an import must precede due to side effects.

**Class members** are grouped by kind, and **alphabetical within each group**:

1. Constructor
2. public variables
3. private variables
4. static public variables
5. static private variables
6. public functions
7. private functions
8. public static functions
9. private static functions

For React components the equivalent order inside the ViewModel hook is: state →
derived values → effects → handlers (each alphabetised within the group).

---

## 7. Feature layout

Each feature is a self-contained vertical so ownership is obvious:

```
src/app/
  models/        offer.ts, listing.ts …            (Model)
  services/      offer.service.ts …                (Logic)
  viewmodels/    useOffersViewModel.ts …           (ViewModel)
  components/    OfferCard.tsx, OfferDialog.tsx …   (View — one per file)
  pages/         Offers.tsx …                       (View — route entry)
  constants/     offer.constants.ts …
  content/blog/  *.md                               (markdown content)
```

---

## Checklist before opening a PR

- [ ] One component/class per file, filename matches.
- [ ] No business logic in the View — it's in a ViewModel or Service.
- [ ] No inline `style={{}}`; no raw colours/sizes/fonts — tokens only.
- [ ] No hardcoded UI strings (i18n) or magic numbers/strings (named constants).
- [ ] Variable names ≥ 4 letters and human-readable (`id` / `ndx` excepted).
- [ ] Top-level declarations and class members ordered per §6.
- [ ] Blog content authored as markdown.
