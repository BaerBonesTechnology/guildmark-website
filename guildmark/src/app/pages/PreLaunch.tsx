import { PromotionSlot } from "../components/PromotionSlot";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router";
import { PreLaunchFooter } from "../components/preLaunch/PreLaunchFooter";
import { PreLaunchHeader } from "../components/preLaunch/PreLaunchHeader";
import { EarlyAccess } from "../components/preLaunch/EarlyAccess";
import { PAID_PLANS, PLAN_CATALOG } from "../constants/planCatalog";

const steps = [
  { id: "inventory", number: "01", label: "Your inventory", title: "Start with the assets you actually have.", body: "Our sample workspace contains a record for 24 Lenovo ThinkPad T14 Gen 2 laptops, Grade B. Their quantity, purchase date and hardware specifications are recorded together for the next decision.", detail: "Physical quantities stay distinct from the number of records. Software and licenses do not use physical-device capacity.", alt: "Real AMPS sample inventory: Lenovo ThinkPad T14 Gen 2, 24 physical devices, Grade B, with recorded specifications." },
  { id: "estimate", number: "02", label: "An informed estimate", title: "Request an estimate for the laptops you select.", body: "The same 24 sample laptops return an ML-assisted estimate of $563.57 per unit: $13,525.68 gross in total. The guided assistant accepts up to five selected laptop records per request.", detail: "This sample estimate excludes fees, shipping and service costs. Missing inputs stay visible; a sale price is not guaranteed.", alt: "Real AMPS result for 24 Lenovo ThinkPad T14 Gen 2 laptops: $563.57 estimated per unit and $13,525.68 gross total, with limitations." },
  { id: "preview", number: "03", label: "Resale preparation", title: "Prepare it for resale.", body: "Prepare the same ThinkPad model, 24-device quantity and suggested unit price for resale in a listing preview. You review the details before taking the next step toward GuildMarket.", detail: "This is a review-only preview. The assistant does not publish listings, place orders or schedule services.", alt: "Real AMPS preview-only listing: Lenovo ThinkPad T14 Gen 2, 24 units, suggested unit price $563.57. Nothing published." },
] as const;

type WorkflowView = typeof steps[number]["id"];
function WorkflowShowcase({ view }: { view: WorkflowView }) {
  const [displayed, setDisplayed] = useState<WorkflowView>(view);
  const [imageError, setImageError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setImageError(false);
    const loaded = new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => { void image.decode().catch(() => undefined).then(() => resolve()); };
      image.onerror = () => reject(new Error("Sample image unavailable"));
      image.src = `/img/amps-workflow/${view}-desktop-focus.jpg`;
    });
    void loaded.then(() => {
      if (!cancelled) setDisplayed(view);
    }).catch(() => { if (!cancelled) setImageError(true); });
    return () => { cancelled = true; };
  }, [view, retry]);
  return <div className="gm-amps-showcase" aria-busy={view !== displayed && !imageError}>
    {steps.map(item => <figure key={item.id} className={`gm-showcase-layer${displayed === item.id ? " is-current" : ""}`} aria-hidden={displayed !== item.id}>
      <img src={`/img/amps-workflow/${item.id}-desktop-focus.jpg`} alt={`Actual GuildMark AMPS workspace with its header and Starter tier. ${item.alt}`} />
      <figcaption>Actual AMPS screen · Demo data. {item.id === "inventory" ? "24 sample devices; not stock for sale." : "Gross estimates exclude fees, shipping and services. Sale prices are not guaranteed."} {item.id === "preview" && "Preview only; nothing published."}</figcaption>
    </figure>)}
    {imageError && <p className="gm-showcase-error" role="alert">Sample image unavailable. <button type="button" onClick={() => setRetry(value => value + 1)}>Retry image</button></p>}
  </div>;
}

function ProductCapture({ view, hero = false }: { view: typeof steps[number]["id"]; hero?: boolean }) {
  const step = steps.find(item => item.id === view)!;
  return <figure className={`gm-product-capture${hero ? " gm-product-capture-hero" : ""}`}>
    <picture><source media="(max-width: 640px)" srcSet={`/img/amps-workflow/${view}-mobile-crop.jpg`} /><img src={`/img/amps-workflow/${view}-desktop-crop.jpg`} alt={step.alt} loading={hero ? "eager" : "lazy"} /></picture>
    <figcaption>Actual product · Demo workspace. {view === "inventory" ? "Sample record details, not stock for sale." : "Gross estimates exclude fees, shipping and services. Sale prices are not guaranteed."} {view === "preview" && "Preview only; nothing published."}</figcaption>
  </figure>;
}

export function PreLaunch() {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];
  return <div className="gm-public gm-home">
    <PreLaunchHeader />
    <main id="main-content">
      <section className="gm-owner-hero gm-container" aria-labelledby="owner-hero-title">
        <div className="gm-owner-hero-copy">
          <p className="gm-overline">AMPS for IT asset owners</p>
          <h1 id="owner-hero-title">Turn idle hardware into revenue.</h1>
          <p className="gm-owner-lead">Recover value from the hardware your team no longer needs. Organize your assets in AMPS, request indicative ML-assisted estimates for supported laptops, and prepare them for resale on GuildMarket.</p>
          <div className="gm-owner-actions"><a className="gm-button gm-button-primary" href="#amps-workflow">See the AMPS workflow <ArrowDown size={16} /></a><Link className="gm-owner-secondary" to="/pre/marketplace">Explore GuildMarket <ArrowUpRight size={16} /></Link></div>
          <p className="gm-owner-note">Early access · Inventory, valuation and resale preparation</p>
        </div>
        <div className="gm-owner-hero-product"><ProductCapture view="estimate" hero /></div>
      </section>
<div className="gm-container"><PromotionSlot placement="home-banner"/></div>

      <div className="gm-role-paths gm-container" aria-label="Choose your path"><p>One asset lifecycle.<br /><strong>Different roles.</strong></p><a href="#amps-workflow"><span>For asset owners</span>Explore AMPS <ArrowRight size={16} /></a><Link to="/pre/marketplace"><span>For procurement teams</span>Explore GuildMarket <ArrowRight size={16} /></Link><a href="#partner-network"><span>For service partners</span>See the intended handoff <ArrowRight size={16} /></a></div>

      <section id="amps-workflow" className="gm-workflow gm-container" aria-labelledby="workflow-title">
        <div className="gm-editorial-heading"><div><p className="gm-overline">The asset-owner workflow</p><h2 id="workflow-title">Find value in the hardware you already own.</h2></div></div>
        <div className="gm-workflow-layout">
          <div className="gm-workflow-story"><div className="gm-workflow-choices" role="group" aria-label="Choose a workflow step">{steps.map((item,index) => <button key={item.id} type="button" aria-pressed={activeStep === index} aria-controls="workflow-detail" onClick={() => setActiveStep(index)}><span>{item.number}</span>{item.label}<ArrowRight size={16} /></button>)}</div><div id="workflow-detail" className="gm-workflow-description" aria-live="polite"><span className="gm-workflow-index">{step.number} / 03</span><h3>{step.title}</h3><p>{step.body}</p><p className="gm-workflow-boundary">{step.detail}</p></div></div>
          <div className="gm-workflow-screen"><WorkflowShowcase view={step.id} /></div>
        </div>
      </section>

      <section className="gm-ai-explanation" aria-labelledby="ai-title"><div className="gm-container gm-ai-grid"><div><p className="gm-overline">Where AI helps</p><h2 id="ai-title">An estimate with<br />its inputs in view.</h2><p>AMPS uses machine learning to help you assess supported laptops. The guided assistant puts recorded inputs and returned estimates together so you can review them in context.</p></div><dl><div><dt>Recorded asset details</dt><dd>Type, condition, purchase date and available CPU, RAM and storage specifications.</dd></div><div><dt>Visible limitations</dt><dd>Missing fields and unavailable results are called out. Gross estimates exclude marketplace fees, shipping and elected services.</dd></div><div><dt>Human control</dt><dd>You choose the records and review the preview. No automatic retirement decisions, publishing or service orders.</dd></div></dl></div></section>

      <section className="gm-market-handoff gm-container" aria-labelledby="market-title"><div className="gm-editorial-heading"><div><p className="gm-overline">For procurement teams / GuildMarket</p><h2 id="market-title">Source hardware for<br />your next fleet or project.</h2></div><div><p>Compare listed models, specifications, condition, available quantities and unit prices in GuildMarket. Assess hardware for fleet replacements or project stock against your team's requirements before choosing what to buy.</p><Link className="gm-text-link" to="/pre/marketplace">Explore the market preview <ArrowUpRight size={16} /></Link></div></div><div className="gm-manifest-line"><span>Compare against your requirements</span><ul><li>Model &amp; specifications</li><li>Condition</li><li>Available quantity</li><li>Price per unit</li></ul></div></section>

      <section id="partner-network" className="gm-partner-story" aria-labelledby="partner-title"><div className="gm-container gm-partner-grid"><div><p className="gm-overline">The intended partner handoff</p><h2 id="partner-title">The work beyond<br />the listing.</h2><p>Some devices need service before they move on. We’re developing a partner network for asset disposition, refurbishment and related work, with the scope and quote reviewed per job.</p><a className="gm-text-link" href="#early-access">Introduce your services <ArrowUpRight size={16} /></a></div><ol><li><span>01</span><div><h3>The selected partner quotes the work.</h3><p>Service scope and price come from the partner for the specific job. GuildMark’s elected-service fee is separate.</p></div></li><li><span>02</span><div><h3>Shipping has its own quote.</h3><p>FedEx determines carrier pricing separately from service work. Live quote coordination is planned, not an available automated workflow.</p></div></li><li><span>03</span><div><h3>The owner reviews the handoff.</h3><p>No service is elected by the assistant. Partner availability, job terms and handling requirements need confirmation before work begins.</p></div></li></ol></div></section>

      <section id="amps-plans" className="gm-home-plans gm-container" aria-labelledby="plans-title"><div className="gm-editorial-heading"><div><p className="gm-overline">AMPS company plans</p><h2 id="plans-title">Choose the capacity<br />your inventory needs.</h2></div><p>Approved monthly USD pricing for early-access planning. Paid onboarding is still being prepared. All plans include one owner seat and the core guided workflow.</p></div><div className="gm-plan-columns">{PAID_PLANS.map(key => {const p = PLAN_CATALOG[key];return <article key={key}><h3>{p.label}</h3><p className="gm-plan-price">${p.price}<span>/ company / month</span></p><dl><div><dt>Active physical devices</dt><dd>{p.physicalDevices.toLocaleString()}</dd></div><div><dt>Fresh valuation credits / month</dt><dd>{p.valuationCredits.toLocaleString()}</dd></div><div><dt>Included owner seat</dt><dd>1</dd></div><div><dt>Marketplace seller fee</dt><dd>{Math.round(p.sellerFee*100)}%</dd></div></dl><p className="gm-plan-addon">Extra staff seat: ${p.additionalSeatPrice}/month.<br />Purchasing is not available yet.</p></article>;})}</div><p className="gm-plan-footnote"><Check size={15} /> Viewing and CSV export do not use valuation credits. No automatic usage overage charges.</p><a className="gm-text-link" href="#early-access">Discuss your asset-owner workspace <ArrowRight size={16} /></a></section>

      <EarlyAccess />

      <section className="gm-home-faq gm-container" aria-labelledby="faq-title"><div><p className="gm-overline">A few practical questions</p><h2 id="faq-title">Know what<br />to expect.</h2></div><div>
        <details><summary>What does the AI actually do?</summary><p>It requests ML-assisted estimates for supported laptop records using recorded condition, age and hardware inputs. The valuation service can use a trained model or a rules fallback; current responses do not identify which produced a result. An estimate is not a guaranteed sale price or a claim about the cause of that price. You review listing previews; the guided assistant does not publish listings or place orders.</p></details>
        <details><summary>What counts toward a plan limit?</summary><p>Active physical-device quantities count toward asset capacity, rather than the number of inventory rows. Software and licenses do not use physical capacity. A successful fresh estimate for an asset record and model-input version uses a valuation credit; cached reuse and viewing do not. One owner seat is included. Extra-seat purchasing is not yet available and seat access does not automatically grant purchase or billing permissions.</p></details>
        <details><summary>How do marketplace and service fees work?</summary><p>The approved schedule is 14% for Free and Starter sellers, 12% for Growth and 10% for Pro, plus a 2.8% hardware buyer fee. It also includes a separate 4% fee on elected partner services, calculated on the chosen partner’s service subtotal, excluding hardware and shipping. Service checkout and quote coordination are still being prepared. Partner service and FedEx shipping quotes are separate.</p></details>
        <details><summary>Can I connect MDM or download invoice PDFs?</summary><p>Jamf and Intune connections are prototypes and do not sync live devices. Invoice drafts are also a prototype; PDF export is not available. We’ll distinguish those capabilities from the working inventory and guided-valuation flows during early access.</p></details>
        <details><summary>Are the screens showing available hardware?</summary><p>No. The walkthrough shows the real AMPS product with a sanitized sample workspace. Its records and estimates demonstrate the workflow and are not offers of stock for sale. The market preview is a separate experience.</p></details>
      </div></section>
    </main>
    <PreLaunchFooter />
  </div>;
}
