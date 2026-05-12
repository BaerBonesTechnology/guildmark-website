/**
 * GuildMark Seller Letter of Intent
 * Static display — not the signing-flow version (that's PartnerLetterOfIntent).
 * Rendered as a reference document for IT teams reviewing the seller onboarding terms.
 */

function Section({ n, title, children }: { n?: string | number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold font-mono">{n !== undefined ? `${n}. ` : ""}{title}</h2>
      <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">{children}</div>
    </div>
  );
}

function Clause({ letter, children }: { letter: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 pl-4">
      <span className="font-mono text-muted-foreground shrink-0">({letter})</span>
      <p>{children}</p>
    </div>
  );
}

export function SellerLetterOfIntent() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-mono text-primary uppercase tracking-widest">Non-Binding · Template</p>
        <h1 className="text-3xl font-bold font-mono">Seller Letter of Intent</h1>
        <p className="text-sm font-mono text-muted-foreground">Template Version: May 2025</p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          This Letter of Intent ("<strong>LOI</strong>") sets forth the mutual non-binding intent of
          Baerhous Media Group, LLC, operating as GuildMark™ ("<strong>GuildMark</strong>"), and the
          prospective seller organization ("<strong>Seller</strong>") to explore a seller relationship
          on the GuildMark B2B hardware marketplace. This LOI does not constitute a binding agreement
          and does not obligate either party to enter into a transaction or formal agreement.
        </p>
      </div>

      <hr className="border-border" />

      <div className="space-y-8">

        <Section n={1} title="Background">
          <p>
            GuildMark operates a B2B platform enabling IT organizations to manage hardware asset
            portfolios, track depreciation, and sell retired or surplus hardware to verified business
            buyers through a secure, escrow-backed marketplace.
          </p>
          <p>
            Seller is an IT organization, enterprise, or business that owns or manages a hardware
            fleet and is exploring the use of GuildMark to optimize asset lifecycle management and
            generate return on retired hardware.
          </p>
        </Section>

        <Section n={2} title="Proposed Seller Relationship">
          <p>Subject to the execution of the Seller Platform Agreement at account activation, the parties intend to:</p>
          <Clause letter="a">
            <strong>Asset Listing:</strong> Seller will list IT hardware assets on the GuildMark
            marketplace using the AMPS dashboard. Listings may be created manually, via CSV import,
            or by pushing assets directly from the AMPS portfolio view.
          </Clause>
          <Clause letter="b">
            <strong>AI-Assisted Pricing:</strong> GuildMark will provide real-time market valuations
            for listed hardware. Seller retains full control over listing price and may accept, modify,
            or reject GuildMark's suggested pricing.
          </Clause>
          <Clause letter="c">
            <strong>Secure Transactions:</strong> All marketplace transactions will be secured through
            Escrow.com. GuildMark charges a 12% platform fee on completed transactions, deducted
            from seller proceeds.
          </Clause>
          <Clause letter="d">
            <strong>Optional Data Wipe:</strong> Seller may elect GuildMark's NIST 800-88 certified
            data destruction service. Under this option, hardware ships to GuildMark's Orlando
            facility, Seller is paid on arrival, and GuildMark handles secure wiping and delivery
            to the buyer.
          </Clause>
          <Clause letter="e">
            <strong>Invoice Generation:</strong> GuildMark will generate compliant tax invoices for
            each completed sale on Seller's behalf.
          </Clause>
        </Section>

        <Section n={3} title="Platform Fees">
          <p>
            There is no subscription or setup fee. GuildMark's platform fee of <strong>12% of the final sale price</strong> is
            charged only on completed transactions. Data wipe services are charged at a flat per-unit rate
            quoted at time of service election. Shipping is charged at actual carrier cost.
          </p>
        </Section>

        <Section n={4} title="Seller Commitments">
          <p>By expressing intent under this LOI, Seller acknowledges and intends to:</p>
          <Clause letter="a">Provide accurate hardware descriptions and condition grades when listing;</Clause>
          <Clause letter="b">Ship accepted orders within agreed timeframes;</Clause>
          <Clause letter="c">Ensure all listed hardware is legally available for sale and free of undisclosed encumbrances; and</Clause>
          <Clause letter="d">Comply with GuildMark's Seller Platform Agreement and Terms of Service upon account activation.</Clause>
        </Section>

        <Section n={5} title="Confidentiality">
          <p>
            In connection with the evaluation of this relationship, the parties may exchange confidential
            information including pricing strategies, hardware inventory data, and internal processes.
            Each party agrees to maintain the confidentiality of such information for a period of two (2)
            years and not to disclose it to third parties without prior written consent.
          </p>
        </Section>

        <Section n={6} title="Non-Binding Nature">
          <p>
            This LOI expresses the parties' intent only and does not create binding legal obligations,
            except with respect to Section 5 (Confidentiality). Either party may withdraw from discussions
            at any time. No binding obligation to sell or purchase hardware arises until both parties
            execute specific transaction agreements through the GuildMark platform.
          </p>
        </Section>

        <Section n={7} title="Next Steps">
          <p>
            To activate a seller account, Seller should complete registration at guildmark.co and accept
            the Seller Platform Agreement during the onboarding process. A GuildMark account manager
            will be assigned to assist with initial asset import and MDM integration setup.
          </p>
        </Section>

        <Section n={8} title="Contact">
          <p>Seller onboarding inquiries: <a href="mailto:sellers@guildmark.co" className="text-primary hover:underline">sellers@guildmark.co</a></p>
        </Section>

      </div>
    </div>
  );
}
