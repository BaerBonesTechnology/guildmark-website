/**
 * GuildMark Seller Platform Agreement
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

export function SellerPlatformAgreement() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-mono text-[#3B82F6] uppercase tracking-widest">Legal</p>
        <h1 className="text-3xl font-bold font-mono">Seller Platform Agreement</h1>
        <p className="text-sm font-mono text-muted-foreground">Effective Date: January 1, 2025 · Last Updated: May 1, 2025</p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          This Seller Platform Agreement ("<strong>Agreement</strong>") governs the terms under which
          verified business sellers ("<strong>Seller</strong>") list and sell IT hardware assets through
          the GuildMark marketplace, operated by Baerhous Media Group, LLC ("<strong>GuildMark</strong>").
          This Agreement supplements and is incorporated into the GuildMark Terms of Service. In the event
          of a conflict, this Agreement controls with respect to seller activities.
        </p>
      </div>

      <hr className="border-border" />

      <div className="space-y-8">

        <Section n={1} title="Seller Eligibility and Verification">
          <p>To list hardware on the GuildMark marketplace, Seller must:</p>
          <Clause letter="a">Be a legally registered business entity in good standing;</Clause>
          <Clause letter="b">Maintain a verified GuildMark account with accurate company information;</Clause>
          <Clause letter="c">Have legal ownership of, or authority to sell, all hardware listed; and</Clause>
          <Clause letter="d">Maintain a valid payment method on file with Escrow.com for any applicable fees or penalties.</Clause>
          <p>GuildMark reserves the right to require additional verification documentation (e.g., proof of ownership, business registration) at any time.</p>
        </Section>

        <Section n={2} title="Listing Requirements">
          <p>Each listing submitted by Seller must include:</p>
          <Clause letter="a"><strong>Accurate identification:</strong> Manufacturer, model name/number, year, and hardware specifications;</Clause>
          <Clause letter="b"><strong>Honest condition grading:</strong> Using GuildMark's condition scale (New, Grade A, Grade B, Grade C, For Parts). Seller is solely responsible for the accuracy of condition representations;</Clause>
          <Clause letter="c"><strong>Data status:</strong> Whether the hardware has been wiped, will be wiped prior to shipment, or contains data (in which case the buyer must elect the GuildMark data wipe service or acknowledge responsibility);</Clause>
          <Clause letter="d"><strong>Quantity:</strong> Number of identical units available; and</Clause>
          <Clause letter="e"><strong>Asking price or acceptance of AI-suggested pricing:</strong> Seller may use GuildMark's AI-generated market price as the list price or set a custom price.</Clause>
          <p>Listings must not misrepresent hardware specifications, condition, or data status. Fraudulent listings are grounds for immediate account suspension and may result in financial penalties.</p>
        </Section>

        <Section n={3} title="Offer and Acceptance Process">
          <Clause letter="a">Buyers may submit offers at or below the list price. Seller receives offers in the GuildMark offer inbox and may accept, counter, or decline each offer.</Clause>
          <Clause letter="b">An offer is binding upon Seller's acceptance. Acceptance initiates the escrow process through Escrow.com.</Clause>
          <Clause letter="c">Seller may not accept an offer and subsequently refuse to ship without cause. Unjustified cancellation after acceptance may result in a cancellation fee equal to 5% of the accepted offer amount.</Clause>
          <Clause letter="d">Counter-offers are valid for 48 hours unless withdrawn earlier. Buyers may accept, counter, or let counters expire.</Clause>
        </Section>

        <Section n={4} title="Platform Fee">
          <p>
            GuildMark charges a platform fee of <strong>12% of the final accepted sale price</strong> per
            completed transaction. The platform fee is deducted from the seller proceeds prior to
            disbursement from escrow. No platform fee is charged on transactions that do not complete.
          </p>
          <p>
            The platform fee covers: marketplace listing exposure, AI-powered pricing intelligence, offer
            management infrastructure, escrow coordination, and invoice generation. It does not cover
            shipping costs or data wipe service fees, which are charged separately.
          </p>
        </Section>

        <Section n={5} title="Shipping and Fulfillment">
          <Clause letter="a"><strong>Direct shipment:</strong> Seller ships directly to the buyer. GuildMark provides prepaid shipping labels for 1–5 units. For 6+ units, pallet pickup can be arranged. Actual carrier cost is charged to the transaction.</Clause>
          <Clause letter="b"><strong>GuildMark facility routing:</strong> Where the buyer elects the data wipe service, Seller ships to GuildMark's Orlando facility. GuildMark takes custody of the hardware, performs NIST 800-88 certified wiping, and ships to the buyer. Seller is paid upon confirmed arrival at the facility.</Clause>
          <Clause letter="c"><strong>Shipping timeline:</strong> Seller must ship within 3 business days of escrow funding confirmation, unless otherwise agreed in writing.</Clause>
          <Clause letter="d"><strong>Packaging:</strong> Seller is responsible for packaging hardware appropriately to prevent damage in transit. Claims for damage due to inadequate packaging are Seller's responsibility.</Clause>
        </Section>

        <Section n={6} title="Payment and Disbursement">
          <p>
            All marketplace payments are held in escrow by Escrow.com pursuant to their terms of service.
            Funds are released to Seller upon buyer confirmation of receipt, or automatically after the
            inspection period (typically 5 business days from confirmed delivery) if the buyer raises no
            dispute.
          </p>
          <p>
            For GuildMark facility-routed transactions (data wipe service), payment to Seller is released
            upon hardware arrival confirmation at the Orlando facility, regardless of buyer receipt.
          </p>
          <p>
            GuildMark deducts its platform fee from escrow proceeds before disbursement. Seller receives
            the net amount (sale price minus platform fee minus applicable shipping costs).
          </p>
        </Section>

        <Section n={7} title="Returns, Disputes, and Refunds">
          <Clause letter="a">Buyers may initiate a dispute within the Escrow.com inspection period if hardware materially differs from the listing description.</Clause>
          <Clause letter="b">GuildMark may mediate disputes at its discretion. Decisions by GuildMark in the mediation process are binding with respect to escrow disbursement.</Clause>
          <Clause letter="c">If hardware is found to have been materially misrepresented, GuildMark may direct Escrow.com to return funds to the buyer. In such cases, Seller is responsible for return shipping costs.</Clause>
          <Clause letter="d">GuildMark does not accept returns of hardware once the data wipe service has been performed.</Clause>
        </Section>

        <Section n={8} title="Prohibited Listings">
          <p>Seller may not list:</p>
          <Clause letter="a">Hardware that is reported stolen or the subject of an insurance claim;</Clause>
          <Clause letter="b">Hardware subject to an active financing agreement, lease, or lien without disclosure and appropriate authorization from the lienholder;</Clause>
          <Clause letter="c">Hardware subject to U.S. export restrictions or government sanctions;</Clause>
          <Clause letter="d">Hardware containing classified, regulated, or personally identifiable information that cannot be wiped; or</Clause>
          <Clause letter="e">Counterfeit or modified hardware presented as genuine OEM products.</Clause>
        </Section>

        <Section n={9} title="Seller Representations">
          <p>By submitting a listing, Seller represents and warrants that:</p>
          <Clause letter="a">Seller has clear legal title to, or authorization to sell, the listed hardware;</Clause>
          <Clause letter="b">The listing description is accurate and complete to the best of Seller's knowledge;</Clause>
          <Clause letter="c">The hardware is not subject to any undisclosed encumbrances; and</Clause>
          <Clause letter="d">Sale of the hardware does not violate any applicable law, regulation, or third-party agreement.</Clause>
        </Section>

        <Section n={10} title="Indemnification">
          <p>
            Seller agrees to indemnify, defend, and hold harmless GuildMark, its officers, directors,
            employees, and agents from any claims, damages, losses, or expenses (including reasonable
            attorneys' fees) arising from: (a) Seller's breach of this Agreement; (b) inaccurate listing
            information; (c) Seller's failure to ship; or (d) third-party claims relating to Seller's
            ownership or right to sell the listed hardware.
          </p>
        </Section>

        <Section n={11} title="Termination">
          <p>
            GuildMark may suspend or terminate a Seller's access to the marketplace for violation of this
            Agreement, the Terms of Service, or any applicable law. Upon termination, any pending listings
            are removed and pending transactions may be cancelled, subject to buyer notification.
          </p>
        </Section>

        <Section n={12} title="Contact">
          <p>Seller support and agreement questions: <a href="mailto:sellers@guildmark.co" className="text-[#3B82F6] hover:underline">sellers@guildmark.co</a></p>
        </Section>

      </div>
    </div>
  );
}
