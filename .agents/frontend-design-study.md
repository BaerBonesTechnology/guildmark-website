# GuildMark frontend design study

Date: October 30, 2026. Status: recommendation for review, not an approved redesign.

## Recommendation

Lead the public site with an asset owner's decision: **take recorded IT inventory, request a supported estimate, and review a resale listing before it goes anywhere.** Show AMPS doing that work in the first screen. Introduce GuildMarket as the destination for reviewed inventory, then explain the intended partner handoff separately.

The current hardware photograph can establish the category, but it cannot explain why someone should choose GuildMark over an electronics marketplace or an inventory tool. A different font, stronger gradient, or more cards will not resolve that problem. The recommendation is a change in the product story and evidence, followed by visual design.

Choose direction 1 below. Borrow the clear service responsibilities from direction 2 for the partner section, without implying that GuildMark already operates a certified ITAD network. Keep the buying experience from direction 3 accessible through GuildMarket rather than making it the asset-owner homepage's main story.

No public landing-page implementation was changed during this study.

## What was actually inspected

The study includes six actual product/service sites and four original Dribbble designer projects. Four competitor desktop renders and all four original Dribbble pages were captured through the parent browser session and visually inspected. Original page text was also read through web retrieval, including the B-Stock seller page and Snipe-IT product page.

The first Dribbble visit encountered human verification; that screen was excluded as design evidence. On the later visit, all four selected original pages displayed their actual mockups without a challenge interaction, including the initially blocked Fixoria example. Independently indexed, publicly accessible original CDN previews were also inspected. No challenge was solved or bypassed. No artwork was copied into GuildMark.

The Dribbble examples are static designer work, not proof of functioning products, conversion results, responsive behavior, or customer adoption. Competitor statements describe their own offers; they are not claims GuildMark may inherit. No logged-in competitor workflow, checkout, or mobile implementation was tested. Responsive recommendations later in this document are proposals, not observations of untested competitor mobile pages.

### Four original Dribbble projects

**1. Digieagle Inc. — Inventory Bazaar marketplace landing page.** [Original designer page](https://dribbble.com/shots/23118531-Marketplace-Design-Landing-Page-Inventory-Management-UX-UI). [Verified desktop capture](../outputs/design-study/dribbble-inventory-bazaar-page.png).

The actual mockup is a long selling narrative, presented in two columns on the shot. It starts with a dark warehouse photograph and a red CTA strip, alternates human cutouts with interface illustrations, then introduces numbered reasons, selling steps, FAQs, and a final CTA. Compact sans-serif headings and repeated red accents organize a mostly white page. **Adopt:** explain a sequence of seller decisions and show an interface at the point it matters. **Avoid:** stock-person filler, distant product proof, generic profit promises, and its fee claims. GuildMark's distinguishing evidence should appear much earlier.

**2. Adri Aghniansyah — inovAset asset-management dashboard.** [Original designer page](https://dribbble.com/shots/23210716-inovAset-Asset-Management-SaaS-Dashboard). [Verified desktop capture](../outputs/design-study/dribbble-inovaset-page.png).

This is the **same dashboard split into light and dark treatments**, not two separate workflows. Four asset-status summaries sit above a value chart and an adjacent activity panel. Disposal is visible in navigation; utilization and a location map occupy the bottom. Purple/blue accents and consistent boundaries connect the dense information. **Adopt:** summarize the asset context, then show activity and the available action. **Avoid:** copying utilization percentages, location tracking, historical bars, or disposal automation that GuildMark cannot substantiate. A plausible chart is not evidence of a working feature.

**3. Kumaravel — IT asset-management dashboard.** [Original designer page](https://dribbble.com/shots/14728860-Asset-Management-Dashboard-design). [Verified desktop capture](../outputs/design-study/dribbble-asset-dashboard-page.png).

The light interface distinguishes hardware assets, software, and accessories in its top summaries. A category/count table sits beside asset-status visualization; a timestamped activity column remains visible on the right, with license-report rows below. Numeric emphasis is backed by concrete rows and categories. The rainbow presentation frame is outside the product. **Adopt:** explicit units and categories, record-level evidence, and retained history. **Avoid:** the presentation gradient and squeezing the entire dashboard into a tiny homepage image. GuildMark should distinguish physical device quantities from records and software/license quantities just as carefully.

**4. Fixoria Studio — Inventory / SaaS landing-page design, showing Fastship.** [Original designer page](https://dribbble.com/shots/25541183-Inventory-SaaS-Landing-Page-Design). [Verified desktop capture](../outputs/design-study/dribbble-fixoria-landing-page.png).

This revisit reached the actual Fastship shipping-SaaS frame, not the verification screen. A large application view inside a laptop frame leads the composition. Green/purple blurred color supports it; lower panels include interface details, testimonial cards and a partnership band with visibly placeholder logos. The hero uses sans-serif type; lower testimonial-section headings use serif type. **Adopt:** give product evidence enough space to be recognized, then expand into specific workflow details. **Avoid:** glow as differentiation and placeholder partnerships or testimonials as proof. The static video/poster frame was inspected; motion and playback behavior were not verified.

### Six real product/service references

| Reference and classification | Observed structure and evidence | Adopt for GuildMark | Avoid transferring |
| --- | --- | --- | --- |
| [Back Market Pro](https://pro.backmarket.com/) — adjacent B2B procurement marketplace. [Desktop capture](../outputs/design-study/backmarket-pro.png). | Search and device-category navigation precede a black-background hero with white serif typography and two clear actions. Business-service promises explain sourcing, quality, support, delivery, and payment. A named account-manager/quote section gives the enterprise offer a human owner. | State the business context and make the next action explicit. Explain who handles each handoff. | Its warranty, delivery, response-time, account-manager and certification promises. Its procurement narrative should not replace an explanation of AMPS. |
| [Swappa selling](https://swappa.com/sell) — adjacent used-tech seller marketplace. Actual page content inspected; no visual/mobile claim. | An exact-product search and device categories lead into four selling steps. Verification, condition requirements, fees and payment explanations follow, then practical FAQs. The organizing unit is a seller action, not an abstract benefit. | Explain selection, preparation, review and listing as distinct actions. Put condition and fee questions beside the decision they affect. | Its moderation guarantees, direct-payment arrangements, fee structure or fully functional-device policy. Do not imply GuildMark shares those rules. |
| [B-Stock marketplace](https://bstock.com/) and [seller platform](https://bstock.com/sellers/) — B2B bulk resale competitor. [Marketplace capture](../outputs/design-study/bstock-marketplace.png). | The buying page prioritizes supplier/category navigation, search, promotional campaigns and dense lot cards with condition, quantities, bid activity and closing times. The seller page instead explains pricing intelligence, buyer access and moving inventory, with sales/contact actions. | Separate audience entry points. When presenting available lots, show quantities and condition before decorative brand imagery. Explain the owner's work separately from buyer browsing. | Rotating promotional noise, auction countdowns on non-auction listings, borrowed supplier logos, or implied inventory/transaction scale. |
| [Iron Mountain ITAD](https://www.ironmountain.com/services/it-asset-lifecycle-management/secure-it-asset-disposition) — adjacent enterprise disposition service. [Desktop capture](../outputs/design-study/ironmountain-itad.png). | A service-category heading, real technical photographs and a distinctive triangular crop establish the physical operation. Service navigation and quote actions sit near explanations of custody, sanitization, recovery and reporting. Proof is about operating responsibilities, not attractive hardware alone. | Give partner services a precise scope and owner. Explain the intended handoff and the records the customer should expect. | Its certifications, chain-of-custody guarantees, global capability, third-party recognition, or data-destruction assurances. GuildMark's partner workflow must earn its own proof. |
| [Snipe-IT](https://snipeitapp.com/) and [product features](https://snipeitapp.com/product) — inventory-software competitor. Actual page content and screenshot-section structure inspected; no captured visual/mobile claim. | The product page organizes concrete asset, license, history and import/export capabilities around screenshots. The homepage separates hosting, support, security and open-source choices. Product objects and operational details carry much of the explanation. | Show actual asset rows, retained history and portable data. Explain AMPS's resale preparation beyond basic inventory. | Its existing integration breadth, open-source position, security assurances, support commitments or hosting guarantees. |
| [EZO EAM](https://ezo.io/ezofficeinventory/) — asset-operations software competitor. [Desktop capture](../outputs/design-study/ezo-assets.png). | Centered operational copy, orange emphasis, blue CTAs, a quantified reassurance strip and enterprise logos precede a product walkthrough. Lower sections organize the offer around asset operations and specific interface examples. | Use actions and product evidence to explain value. A short walkthrough should have a visible purpose and destination. | Logo walls or numerical results without GuildMark evidence. The broad operating-system claim and large feature catalog would also overstate current AMPS scope. |

## Why the present homepage still feels generic

This diagnosis comes from the user's feedback and the current [PreLaunch.tsx](../guildmark/src/app/pages/PreLaunch.tsx), not from assuming that every competitor uses the same template.

- The headline describes hardware longevity. It does not identify the asset owner's inventory-to-resale problem.
- The lead could fit many buyer/seller marketplaces. AMPS, guided estimates, reviewable previews and partner responsibilities are absent from the first explanation.
- The main action sends visitors shopping. The first supporting section is another set of hardware categories. Together they establish a retail hierarchy before explaining the owner workflow.
- The hero's rendered laptops communicate a category. They provide no evidence of GuildMark's product or the decisions a customer can make.
- General phrases about a next chapter, possibility and hardware movement replace the details that could distinguish the business: quantity, specifications, estimate limitations, owner review, listing, and job-specific service quotes.

There is useful restraint in the existing public layout: whitespace, readable text, limited color and clear navigation. Keep those advantages. Replace the subject of the page rather than adding more surface effects.

## Three distinct directions

### 1. Show the asset-owner workflow — recommended

**First impression:** an AMPS workspace for preparing an IT refresh or disposal decision. The first visual follows one recognizable laptop record from recorded quantity/specifications to an estimate and a review-only listing preview.

**Composition:** short copy at left, a large, readable product view at right. Below, a three-stage sequence reuses the same asset record. Use the existing neutral/blue public identity, with AMPS accent colors confined to real controls and statuses. Strong heading hierarchy and tabular numbers should do more work than decorative shapes.

**Why choose it:** it gives the current product something specific to demonstrate. Inventory tools explain ownership; marketplaces explain shopping. GuildMark can explain the owner's transition from recorded inventory toward a reviewed resale decision.

**Risk:** an impressive but invented dashboard would recreate the original problem. Use working views and clearly marked sample records. Do not add utilization detection, future depreciation forecasts or automated disposal decisions for visual completeness.

### 2. Explain the disposition handoff

**First impression:** a business coordinating what happens to retiring IT equipment. The central visual is a labeled asset journey with clear responsibilities: asset owner, GuildMark workflow, buyer, and elected service partner.

**Composition:** a restrained editorial heading, documented process imagery and a service record. Real hardware-handling photographs can support the explanation when GuildMark has permission and an actual operation to show. Keep the partner's job quote and the customer's review visible.

**Why choose it:** it makes the partner network and post-decision work easier to understand, especially for IT teams concerned about sensitive devices.

**Risk:** this direction can imply that GuildMark already performs certified sanitization, collection or custody operations. Until those processes and partners are verified, describe the intended coordination and availability honestly. This is better as direction 1's later section than as the present hero.

### 3. Show the business inventory behind the market

**First impression:** a marketplace for identifiable business hardware lots, supported by an owner's inventory tools. Lead with a specific listing's model, grade, unit quantity, available specifications and price basis.

**Composition:** crisp listing photography and manifest-like detail; visible buyer/owner paths; AMPS shown beside the listing-preparation step. Use typography and alignment to organize information rather than a consumer sale-promotion carousel.

**Why choose it:** useful when genuine available stock and buyer demand become the primary acquisition channel.

**Risk:** it needs real listings and availability. Without them, it becomes the current generic hardware site with more invented cards. It also makes AMPS feel secondary again. Reserve this direction for GuildMarket's entry page or a later product stage.

## Three precise hero-copy variants

These are alternatives for review, not three sections to combine. All keep the present early-access context. A product walkthrough CTA must lead to a visible explanation, not an unexpected login or payment wall.

### Variant A — owner workflow

Eyebrow: **AMPS for IT asset owners**

Headline: **From IT inventory to a listing you can review.**

Supporting copy: Organize device quantities in AMPS, request ML-assisted estimates for supported laptops, and prepare listing previews for GuildMarket. You choose what moves next.

Primary CTA: **See the AMPS workflow** — scroll to the working-product explanation.

Secondary CTA: **Join asset-owner early access** — use the existing early-access flow.

### Variant B — retirement decision

Eyebrow: **Preparing for an IT refresh?**

Headline: **Review the resale potential of the laptops you're retiring.**

Supporting copy: Bring your inventory into AMPS, review the recorded condition and specifications, and request an estimate before preparing a listing. Explore partner support for the next handoff as it becomes available.

Primary CTA: **See an asset review**.

Secondary CTA: **Discuss your next refresh** — use a real existing contact/early-access path, without promising an assigned manager or response SLA.

### Variant C — owner and market

Eyebrow: **Business hardware, with the asset details attached**

Headline: **Prepare your surplus IT for its next business owner.**

Supporting copy: Use AMPS to organize quantities and laptop estimates, then review a listing preview for GuildMarket. Buyers can explore condition, specifications and available units; you retain the listing decision.

Primary CTA: **See how owners prepare a listing**.

Secondary CTA: **Explore the market preview** — preserve the existing preview context; do not imply that example stock is currently for sale.

**Recommended wording:** variant A. It names the product, the input, the output and human control. The earlier hardware-longevity message can become a supporting mission statement after the workflow is understood.

## Proposed page hierarchy for direction 1

| Order | Section | Concrete content and visual | Action or purpose |
| --- | --- | --- | --- |
| 1 | Clear role navigation | AMPS for asset owners, GuildMarket, partner network, company/contact. Keep sign-in distinct from early access. | A buyer can reach the market without making the homepage's owner story compete with three equal hero CTAs. |
| 2 | Owner-focused hero | Variant A plus a real AMPS screen crop. Show the model, quantity, grade and next action at a readable size. Label sample data. | Explain what GuildMark does within the first screen. |
| 3 | One asset, three decisions | Inventory record → requested laptop estimate → review-only listing preview. Keep the same model and quantity throughout. | Demonstrate continuity rather than three unrelated feature cards. |
| 4 | What the AI contributes | Show recorded type, condition, purchase date/age and hardware inputs next to the returned estimate. Explain missing-data and unavailable-result states. | Make the AI's job concrete without implying causal explanations, guaranteed prices or an autonomous agent. |
| 5 | How the asset reaches GuildMarket | A preview and the listing information a buyer needs. Clearly distinguish preparing a preview from publishing or completing a sale. | Give the marketplace a specific role in the workflow. |
| 6 | The partner handoff | Explain that elected jobs are quoted by the chosen service partner. Separate FedEx shipping quotes from partner work and GuildMark's service fee. Mark availability and unimplemented coordination honestly. | Explain the network's intended value without claiming a working certified network. |
| 7 | Plans and boundaries | Approved $39/$99/$199 company plans, physical-device limits, valuation credits and one included owner seat. Extra-seat purchasing is not available yet. Keep full rules in a linked detail/FAQ area. | Clarify commercial scope without presenting incomplete paid onboarding as ready. |
| 8 | Early access by role | Asset-owner interest first; clear alternate paths for buyers and prospective partners. Ask for the information the existing form actually uses. | Convert interest through a working, appropriately scoped flow. |
| 9 | Practical questions | Supported estimates, quantity versus record count, preview versus listing, fees, partner scope, data handling and retained export access. | Resolve the real barriers to trying the product. |

Skip a customer-logo strip, claimed recovery results, invented testimonials and a continuously moving market feed until genuine evidence exists. A reproducible product walkthrough is a better form of early proof.

## Imagery and responsive behavior

### Make the working product the main evidence

- Capture the actual inventory, guided assistant and listing preview with sanitized demo records. Show one short task, not every chart and navigation item at once.
- Put a small **Sample workspace** label beside the image. Values must come from a real demo response or be explicitly labeled illustrative. Do not manufacture recovery percentages, buyers, customer counts, demand scores or AI accuracy.
- Use a straight-on capture. Perspective tilts and overlapping floating panels make specifications and the review decision harder to read.
- Prefer a small, deliberate series of product states to a fake chat conversation. A credit count, record quantity, missing-input message and review button explain the product better than a decorative AI sparkle.
- Keep hardware photography secondary: the marketplace, supported device categories or a documented partner process. Generated studio hardware is category illustration, not evidence of actual inventory, partners or operations.
- Do not expose tenant names, private serial numbers, emails, billing data or real customer records in public captures.

### Desktop proposal

Use a five/seven-column hero split within a roughly 1,200–1,280px content width. Keep the supporting paragraph short enough that the product is visible alongside it. At a typical desktop viewport, the heading, both actions and one complete meaningful product state should appear before a long scroll. The next section should begin close enough to make the workflow continuation obvious.

Show a deliberate product crop: a few asset rows with quantity and condition, then the selected record's next step. A tiny full-dashboard screenshot is not a substitute for readable proof. Use existing type assets for the first composition review; choose a new type family only if it solves a clear hierarchy or brand problem after the direction is approved.

### Mobile proposal

Stack heading, short explanation, primary action, secondary action and a purpose-made product crop. Do not scale a desktop dashboard down to illegible type. Show the same model, physical quantity and review action in a narrow record view, with a link to the fuller walkthrough. If the crop is a marketing composition rather than an implemented mobile screen, label it as an illustration instead of implying it is a product screenshot.

Keep the three workflow states in a vertical reading order. Avoid autoplay carousels, hover-only explanations and horizontally clipped tables. Provide visible keyboard focus, readable body text, meaningful image descriptions and reduced-motion behavior. A short optional demonstration video should have captions, a poster image and user-controlled playback.

The mobile page should still answer four questions without needing the desktop view: Who is this for? What can I do? What happens next? What is currently available?

## Claims and scope that the design must preserve

The current core demo can show persistent inventory, quantity-preserving CSV, retained records/history, supported laptop estimates and review-only previews. It can also show the distinction between fresh valuation usage and cached reuse. Those are useful facts to demonstrate, not broad reliability or model-accuracy guarantees.

Jamf/Intune integrations, expanded reports, team invitations, additional-seat purchasing, invoice/PDF readiness and service-network operations must not be implied by aspirational screenshots. The assistant is guided and bounded; it is not an established free-form conversational agent, an idle-device detector or an autonomous publisher. A partner's certification or an external carrier's capability is not GuildMark's own certification or implemented integration.

Price approval does not establish production billing readiness. Keep early access and paid activation distinct until billing verification and the relevant launch gates are complete. The optional Pro goodwill cap and pool are proposals, not a promised customer protection benefit.

## Review before another styling pass

The next reviewable design deliverable should be two compositions for the **same approved direction**: a desktop first screen and a narrow mobile first screen, each showing real product evidence and the matching next section. Review the story before choosing ornamental treatments.

Use these acceptance questions:

1. Can a new asset owner explain the AMPS → estimate → preview relationship after the first screen and workflow section?
2. Does the first image show something recognizably GuildMark rather than a generic pile of laptops or an invented dashboard?
3. Is the difference between a physical device, an inventory record, an estimate and a published listing understandable?
4. Can buyers and prospective partners find their paths without obscuring the owner's main task?
5. Are implemented features, sample data, planned capabilities and partner responsibilities distinguishable?
6. Do the actions lead to working explanations/forms without pretending that paid access or an unavailable integration is ready?

Do not claim that this study proves conversion improvement. The recommended direction is a product-positioning hypothesis informed by actual visual and content review. It should be checked with prospective asset owners before broader implementation.
