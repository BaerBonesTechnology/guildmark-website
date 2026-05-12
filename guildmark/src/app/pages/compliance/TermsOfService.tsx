/**
 * GuildMark Terms of Service
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

export function TermsOfService() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-mono text-primary uppercase tracking-widest">Legal</p>
        <h1 className="text-3xl font-bold font-mono">Terms of Service</h1>
        <p className="text-sm font-mono text-muted-foreground">Effective Date: January 1, 2025 · Last Updated: May 1, 2025</p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          These Terms of Service ("<strong>Terms</strong>") govern your access to and use of the GuildMark
          platform and related services operated by Baerhous Media Group, LLC ("<strong>GuildMark</strong>").
          By creating an account or using our Services, you agree to be bound by these Terms.
        </p>
      </div>

      <hr className="border-border" />

      <div className="space-y-8">

        <Section n={1} title="Eligibility and Accounts">
          <p>The GuildMark platform is a B2B service intended exclusively for businesses and business professionals. By using the Services, you represent that:</p>
          <Clause letter="a">You are at least 18 years of age;</Clause>
          <Clause letter="b">You are using the platform on behalf of a legally registered business entity;</Clause>
          <Clause letter="c">You have the authority to bind your company to these Terms; and</Clause>
          <Clause letter="d">Your use of the Services does not violate any applicable law or regulation.</Clause>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
        </Section>

        <Section n={2} title="The GuildMark Platform">
          <p>GuildMark provides the following primary services:</p>
          <Clause letter="a"><strong>Asset Management & Portfolio System (AMPS):</strong> Tools for tracking IT hardware assets, monitoring depreciation, syncing with MDM providers, and generating invoices.</Clause>
          <Clause letter="b"><strong>B2B Marketplace:</strong> A platform for verified businesses to list, buy, and sell certified IT hardware. All transactions are facilitated through Escrow.com.</Clause>
          <Clause letter="c"><strong>Data Wipe Service:</strong> Optional NIST 800-88 certified data destruction services at GuildMark's Orlando, Florida facility.</Clause>
          <Clause letter="d"><strong>Market Valuation:</strong> AI-powered real-time hardware valuations based on market data. Valuations are estimates and not guarantees of resale value.</Clause>
        </Section>

        <Section n={3} title="Marketplace Rules">
          <p>When listing or purchasing hardware on the GuildMark marketplace, you agree to:</p>
          <Clause letter="a">Provide accurate descriptions of hardware including make, model, condition, and any known defects. Misrepresentation is grounds for account suspension.</Clause>
          <Clause letter="b">Honor accepted offers. Once an offer is accepted and escrow is initiated, cancellation may result in penalties as described in our Seller Platform Agreement.</Clause>
          <Clause letter="c">Comply with all applicable laws regarding the sale of hardware, including export control regulations.</Clause>
          <Clause letter="d">Not list hardware that is stolen, subject to active leases without disclosure, subject to government sanctions, or otherwise not legally available for sale.</Clause>
          <Clause letter="e">Complete shipment within the timeframes specified at listing. Failure to ship may result in escrow cancellation and account penalties.</Clause>
        </Section>

        <Section n={4} title="Fees and Payments">
          <Clause letter="a"><strong>Platform Fee:</strong> 12% of the final sale price on each completed marketplace transaction, deducted from seller proceeds prior to disbursement.</Clause>
          <Clause letter="b"><strong>Data Wipe Service:</strong> A flat per-unit rate based on device type and volume, quoted at time of service request.</Clause>
          <Clause letter="c"><strong>Shipping:</strong> Charged at actual carrier cost. Prepaid labels for 1–5 units; pallet pickup available for 6+ units.</Clause>
          <p>All payments are processed through Escrow.com. GuildMark does not store payment card information. Fees are subject to change with 30 days' notice.</p>
        </Section>

        <Section n={5} title="Intellectual Property">
          <p>GuildMark and its licensors own all right, title, and interest in the Services. GuildMark™ is a trademark of Baerhous Media Group, LLC.</p>
          <p>You grant GuildMark a non-exclusive, royalty-free license to use, display, and reproduce content you submit (such as listing descriptions and asset photos) solely as necessary to operate the Services.</p>
        </Section>

        <Section n={6} title="Prohibited Conduct">
          <p>You agree not to:</p>
          <Clause letter="a">Circumvent, disable, or interfere with security features of the Services;</Clause>
          <Clause letter="b">Use the Services for any unlawful purpose;</Clause>
          <Clause letter="c">Reverse engineer or decompile any part of the Services;</Clause>
          <Clause letter="d">Use automated means to scrape or extract data from the platform; or</Clause>
          <Clause letter="e">Engage in fraudulent activity, including artificially inflating offer prices.</Clause>
        </Section>

        <Section n={7} title="Disclaimers and Limitation of Liability">
          <p>THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. MARKET VALUATIONS ARE ESTIMATES ONLY. GUILDMARK ACTS AS A PLATFORM INTERMEDIARY AND DOES NOT GUARANTEE THE QUALITY OR DELIVERY OF MARKETPLACE ITEMS.</p>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, GUILDMARK'S TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF (A) FEES PAID IN THE THREE MONTHS PRECEDING THE CLAIM OR (B) $500.</p>
        </Section>

        <Section n={8} title="Governing Law">
          <p>These Terms are governed by the laws of the State of Florida. Disputes shall be resolved by binding arbitration administered by JAMS in Orange County, Florida, except either party may seek injunctive relief in any court of competent jurisdiction.</p>
        </Section>

        <Section n={9} title="Contact">
          <p>Questions about these Terms: <a href="mailto:legal@guildmark.co" className="text-primary hover:underline">legal@guildmark.co</a></p>
        </Section>

      </div>
    </div>
  );
}
