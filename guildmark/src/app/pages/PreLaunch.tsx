import { PromotionSlot } from "../components/PromotionSlot";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router";
import { PreLaunchFooter } from "../components/preLaunch/PreLaunchFooter";
import { PreLaunchHeader } from "../components/preLaunch/PreLaunchHeader";
import { EarlyAccess } from "../components/preLaunch/EarlyAccess";
import { PAID_PLANS, PLAN_CATALOG } from "../constants/planCatalog";

const steps = [
  { id: "inventory", number: "01", label: "See what you have", title: "Bring the bigger picture into focus.", body: "Surplus laptops can sit across offices, storerooms and spreadsheets. Bring your equipment together in one view so your team can see what is available and where to start.", detail: "A clearer inventory gives your next refresh a starting point.", alt: "AMPS inventory showing equipment quantities, condition and specifications. Illustrative demo data." },
  { id: "estimate", number: "02", label: "Discover its value", title: "See potential beyond the storage shelf.", body: "Equipment your team has outgrown may still have value to another business. Get an indicative estimate for supported laptops to help weigh resale against keeping them in storage.", detail: "Use an estimate to inform your decision. Final proceeds depend on the sale and associated costs.", alt: "AMPS valuation view showing an indicative equipment estimate. Illustrative demo data." },
  { id: "preview", number: "03", label: "Plan your next move", title: "Turn an estimate into a next step.", body: "Build a clearer resale picture with the equipment details, quantities and asking price together. Review your options before preparing to reach business buyers on GuildMarket.", detail: "You decide what moves forward, and when.", alt: "AMPS resale preparation view showing equipment details and a listing preview. Illustrative demo data." },
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
      <img src={`/img/amps-workflow/${item.id}-desktop-focus.jpg`} alt={item.alt} />
      <figcaption>Product preview · Illustrative data. Estimates are indicative, not guaranteed sale prices.</figcaption>
    </figure>)}
    {imageError && <p className="gm-showcase-error" role="alert">Sample image unavailable. <button type="button" onClick={() => setRetry(value => value + 1)}>Retry image</button></p>}
  </div>;
}

function ProductCapture({ view, hero = false }: { view: typeof steps[number]["id"]; hero?: boolean }) {
  const step = steps.find(item => item.id === view)!;
  return <figure className={`gm-product-capture${hero ? " gm-product-capture-hero" : ""}`}>
    <picture><source media="(max-width: 640px)" srcSet={`/img/amps-workflow/${view}-mobile-crop.jpg`} /><img src={`/img/amps-workflow/${view}-desktop-crop.jpg`} alt={step.alt} loading={hero ? "eager" : "lazy"} /></picture>
    <figcaption>Product preview · Illustrative data. Estimates are indicative, not guaranteed sale prices.</figcaption>
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
          <p className="gm-owner-lead">Make room for what’s next. Understand the potential resale value of equipment your business no longer needs, then take a more informed next step.</p>
          <div className="gm-owner-actions"><a className="gm-button gm-button-primary" href="#amps-workflow">See the opportunity <ArrowDown size={16} /></a><Link className="gm-owner-secondary" to="/pre/marketplace">Explore GuildMarket <ArrowUpRight size={16} /></Link></div>
          <p className="gm-owner-note">Early access · Inventory, valuation and resale preparation</p>
        </div>
        <div className="gm-owner-hero-product"><ProductCapture view="estimate" hero /></div>
      </section>
<div className="gm-container"><PromotionSlot placement="home-banner"/></div>

      <div className="gm-role-paths gm-container" aria-label="Choose your path"><p>One asset lifecycle.<br /><strong>Different roles.</strong></p><a href="#amps-workflow"><span>For asset owners</span>Explore AMPS <ArrowRight size={16} /></a><Link to="/pre/marketplace"><span>For procurement teams</span>Explore GuildMarket <ArrowRight size={16} /></Link><a href="#partner-network"><span>For service partners</span>Explore the partner network <ArrowRight size={16} /></a></div>

      <section id="amps-workflow" className="gm-workflow gm-container" aria-labelledby="workflow-title">
        <div className="gm-editorial-heading"><div><p className="gm-overline">From surplus to opportunity</p><h2 id="workflow-title">Find value in the hardware you already own.</h2></div></div>
        <div className="gm-workflow-layout">
          <div className="gm-workflow-story"><div className="gm-workflow-choices" role="group" aria-label="Choose a workflow step">{steps.map((item,index) => <button key={item.id} type="button" aria-pressed={activeStep === index} aria-controls="workflow-detail" onClick={() => setActiveStep(index)}><span>{item.number}</span>{item.label}<ArrowRight size={16} /></button>)}</div><div id="workflow-detail" className="gm-workflow-description" aria-live="polite"><span className="gm-workflow-index">{step.number} / 03</span><h3>{step.title}</h3><p>{step.body}</p><p className="gm-workflow-boundary">{step.detail}</p></div></div>
          <div className="gm-workflow-screen"><WorkflowShowcase view={step.id} /></div>
        </div>
      </section>

      <section className="gm-ai-explanation" aria-labelledby="ai-title"><div className="gm-container gm-ai-grid"><div><p className="gm-overline">Make informed decisions</p><h2 id="ai-title">Know what your<br />next move could be.</h2><p>Before you plan a refresh or clear a storeroom, get a better sense of the value already in your business. AMPS brings equipment details and indicative estimates together to support that conversation.</p></div><dl><div><dt>A clearer starting point</dt><dd>See which equipment is available and bring the details together for your team.</dd></div><div><dt>More context for your decision</dt><dd>Indicative estimates help you explore resale potential before committing to a next step.</dd></div><div><dt>Your business, your timing</dt><dd>Review the opportunity and decide which equipment you want to prepare for resale.</dd></div></dl></div></section>

      <section className="gm-market-handoff gm-container" aria-labelledby="market-title"><div className="gm-editorial-heading"><div><p className="gm-overline">For procurement teams / GuildMarket</p><h2 id="market-title">Source hardware for<br />your next fleet or project.</h2></div><div><p>Compare listed models, specifications, condition, available quantities and unit prices in GuildMarket. Assess hardware for fleet replacements or project stock against your team's requirements before choosing what to buy.</p><Link className="gm-text-link" to="/pre/marketplace">Explore the market preview <ArrowUpRight size={16} /></Link></div></div><div className="gm-manifest-line"><span>Compare against your requirements</span><ul><li>Model &amp; specifications</li><li>Condition</li><li>Available quantity</li><li>Price per unit</li></ul></div></section>

      <section id="partner-network" className="gm-partner-story" aria-labelledby="partner-title"><div className="gm-container gm-partner-grid"><div><p className="gm-overline">The GuildMark partner network</p><h2 id="partner-title">The work beyond<br />the listing.</h2><p>Give equipment a better path to its next owner. We’re building a network to help businesses prepare devices, coordinate their handoff and keep the work moving.</p><a className="gm-text-link" href="#early-access">Introduce your services <ArrowUpRight size={16} /></a></div><ol><li><span>01</span><div><h3>The right services for your equipment.</h3><p>Explore support for data erasure, imaging and resale preparation based on what your devices need.</p></div></li><li><span>02</span><div><h3>Trusted logistics partners.</h3><p>Plan the movement of equipment around your business’s timing and handling needs.</p></div></li><li><span>03</span><div><h3>A handoff you can plan around.</h3><p>Review the service scope and next steps before your equipment moves forward.</p></div></li></ol></div></section>

      <section id="amps-plans" className="gm-home-plans gm-container" aria-labelledby="plans-title"><div className="gm-editorial-heading"><div><p className="gm-overline">AMPS company plans</p><h2 id="plans-title">Choose the capacity<br />your inventory needs.</h2></div><p>Find a starting point for your team, with room to grow as your equipment portfolio grows. Early-access plans are shown below.</p></div><div className="gm-plan-columns">{PAID_PLANS.map(key => {const p = PLAN_CATALOG[key];return <article key={key}><h3>{p.label}</h3><p className="gm-plan-price">${p.price}<span>/ company / month</span></p><dl><div><dt>Active physical devices</dt><dd>{p.physicalDevices.toLocaleString()}</dd></div><div><dt>Fresh valuation credits / month</dt><dd>{p.valuationCredits.toLocaleString()}</dd></div><div><dt>Included owner seat</dt><dd>1</dd></div><div><dt>Marketplace seller fee</dt><dd>{Math.round(p.sellerFee*100)}%</dd></div></dl><p className="gm-plan-addon">Extra staff seat: ${p.additionalSeatPrice}/month.<br />Purchasing is not available yet.</p></article>;})}</div><p className="gm-plan-footnote"><Check size={15} /> Viewing and CSV export do not use valuation credits. No automatic usage overage charges.</p><a className="gm-text-link" href="#early-access">Discuss your asset-owner workspace <ArrowRight size={16} /></a></section>

      <EarlyAccess />

      <section className="gm-home-faq gm-container" aria-labelledby="faq-title"><div><p className="gm-overline">A few practical questions</p><h2 id="faq-title">Know what<br />to expect.</h2></div><div>
        <details><summary>How does GuildMark help me find value?</summary><p>AMPS helps you bring your equipment into view and explore the potential resale value of supported laptops. Use that context to discuss your next refresh, decide what to keep and prepare equipment for resale. Estimates are indicative; final sale prices and costs vary.</p></details>
        <details><summary>What counts toward a plan limit?</summary><p>Choose a plan based on the number of physical devices you manage and the valuation capacity your team needs. Viewing your inventory and exporting a CSV do not use valuation credits.</p></details>
        <details><summary>How do marketplace and service fees work?</summary><p>Marketplace seller fees vary by plan. Equipment, optional partner services and shipping are separate costs. Review the applicable terms and quotes before committing.</p></details>
        <details><summary>Who is early access for?</summary><p>IT teams managing surplus equipment, businesses sourcing hardware and service partners helping devices move to their next owner. Tell us what you need, and we’ll discuss how GuildMark could fit your workflow.</p></details>
        <details><summary>Are the screens showing available hardware?</summary><p>No. Product previews use illustrative data to show the experience. Explore the marketplace preview separately to see how browsing equipment works.</p></details>
      </div></section>
    </main>
    <PreLaunchFooter />
  </div>;
}
