/**
 * GuildMark Partner Agreement
 * The full binding partner agreement — executed after the LOI process.
 */

function Section({ n, title, children }: { n?: string | number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold ">{n !== undefined ? `${n}. ` : ""}{title}</h2>
      <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">{children}</div>
    </div>
  );
}

function Clause({ letter, children }: { letter: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 pl-4">
      <span className=" text-muted-foreground shrink-0">({letter})</span>
      <p>{children}</p>
    </div>
  );
}

export function PartnerGuildmarkAgreement() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs  text-primary uppercase tracking-widest">Binding Agreement · Template</p>
        <h1 className="text-3xl font-bold ">GuildMark Partner Agreement</h1>
        <p className="text-sm  text-muted-foreground">Template Version: May 2025 · Executed copies are individually dated</p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          This GuildMark Partner Agreement ("<strong>Agreement</strong>") is entered into by and between
          Baerhous Media Group, LLC, operating as GuildMark™ ("<strong>GuildMark</strong>"), and the
          partner organization identified in the executed Partner Schedule ("<strong>Partner</strong>").
          This Agreement governs the rights and obligations of both parties with respect to the partnership
          relationship and supersedes any prior Letter of Intent or preliminary discussions between the parties.
        </p>
      </div>

      <hr className="border-border" />

      <div className="space-y-8">

        <Section n={1} title="Definitions">
          <Clause letter="a"><strong>"Partner Schedule"</strong> means the schedule attached to and forming part of this Agreement, setting out Partner-specific terms including partner type, territory (if applicable), revenue share rates, and effective date.</Clause>
          <Clause letter="b"><strong>"Platform"</strong> means the GuildMark B2B IT asset management and marketplace platform, including AMPS, the marketplace, and all associated APIs and tooling.</Clause>
          <Clause letter="c"><strong>"End Customer"</strong> means a business customer introduced or referred to GuildMark by Partner, or a customer whose hardware assets Partner manages on the Platform on the customer's behalf.</Clause>
          <Clause letter="d"><strong>"Transaction Volume"</strong> means the aggregate gross merchandise value (GMV) of marketplace transactions attributable to Partner's activities in a given period, as tracked by GuildMark.</Clause>
          <Clause letter="e"><strong>"Confidential Information"</strong> has the meaning given in Section 8.</Clause>
        </Section>

        <Section n={2} title="Partner Appointment">
          <Clause letter="a">GuildMark appoints Partner as a non-exclusive partner of the type specified in the Partner Schedule, subject to the terms of this Agreement.</Clause>
          <Clause letter="b">Nothing in this Agreement prevents GuildMark from appointing additional partners of the same type in the same territory, unless an exclusive territory is expressly granted in the Partner Schedule.</Clause>
          <Clause letter="c">Partner accepts the appointment and agrees to actively promote and facilitate GuildMark's services to prospective End Customers in good faith.</Clause>
        </Section>

        <Section n={3} title="Partner Rights and Platform Access">
          <Clause letter="a"><strong>Partner Dashboard:</strong> GuildMark will provide Partner with access to a partner dashboard enabling management of referred accounts, tracking of referred transaction activity, and access to partner-specific pricing and feature flags.</Clause>
          <Clause letter="b"><strong>API Access:</strong> Where applicable to Partner's business type (e.g., MSP integration), GuildMark will provide API credentials subject to GuildMark's API terms and rate limits.</Clause>
          <Clause letter="c"><strong>Co-branded Materials:</strong> GuildMark will provide Partner with co-branded marketing materials, subject to GuildMark's brand guidelines. Partner may not modify GuildMark branding without prior written approval.</Clause>
          <Clause letter="d"><strong>Training and Onboarding:</strong> GuildMark will provide Partner with reasonable onboarding support and access to training materials to enable Partner to effectively represent and use the Platform.</Clause>
          <Clause letter="e"><strong>Priority Support:</strong> Partner accounts receive priority support response times as specified in the Partner Schedule.</Clause>
        </Section>

        <Section n={4} title="Partner Obligations">
          <p>Partner agrees to:</p>
          <Clause letter="a">Represent GuildMark's services accurately and in compliance with GuildMark's approved messaging and brand guidelines;</Clause>
          <Clause letter="b">Not make representations or warranties about the Platform beyond those explicitly authorized by GuildMark in writing;</Clause>
          <Clause letter="c">Promptly notify GuildMark of any customer complaints, regulatory inquiries, or issues relating to the Platform;</Clause>
          <Clause letter="d">Maintain any certifications, licenses, or registrations required to operate in its business category;</Clause>
          <Clause letter="e">Comply with all applicable laws, including data protection laws, in its activities under this Agreement; and</Clause>
          <Clause letter="f">Meet any minimum activity or referral thresholds specified in the Partner Schedule, where applicable.</Clause>
        </Section>

        <Section n={5} title="Fees, Revenue Share, and Payment">
          <Clause letter="a"><strong>Revenue Share:</strong> GuildMark will pay Partner a revenue share on transactions attributable to Partner as specified in the Partner Schedule. Revenue share percentages are calculated on net platform fees collected by GuildMark (i.e., after Escrow.com fees and chargebacks) and are not paid on shipping or data wipe service charges.</Clause>
          <Clause letter="b"><strong>Volume Discounts:</strong> Where Partner achieves Transaction Volume thresholds specified in the Partner Schedule, GuildMark may offer reduced platform fees for Partner-referred transactions.</Clause>
          <Clause letter="c"><strong>Data Wipe Service Rates:</strong> Where applicable to Partner's model, data wipe service pricing will be negotiated and set out in a separate Data Wipe Service Schedule.</Clause>
          <Clause letter="d"><strong>Payment Terms:</strong> Revenue share payments are made monthly in arrears, within 15 business days of month-end, by ACH or wire transfer to Partner's nominated account. Minimum payment threshold: $100 (amounts below threshold roll to the following month).</Clause>
          <Clause letter="e"><strong>Reporting:</strong> GuildMark will provide Partner with monthly transaction reports itemizing attributed transactions, gross GMV, platform fees collected, and revenue share payable.</Clause>
        </Section>

        <Section n={6} title="Intellectual Property">
          <Clause letter="a">GuildMark retains all right, title, and interest in the Platform, GuildMark brand, trademarks, and all underlying technology. This Agreement grants Partner no ownership rights in any GuildMark intellectual property.</Clause>
          <Clause letter="b">Partner grants GuildMark a non-exclusive license to display Partner's company name and logo on GuildMark's partner directory and co-marketing materials during the Term.</Clause>
          <Clause letter="c">All feedback, suggestions, or ideas that Partner provides about the Platform are deemed non-confidential and may be used by GuildMark without restriction or compensation.</Clause>
        </Section>

        <Section n={7} title="Data Protection">
          <Clause letter="a">Each party agrees to comply with all applicable data protection and privacy laws in the performance of this Agreement.</Clause>
          <Clause letter="b">Where Partner processes End Customer personal data on behalf of GuildMark, the parties will execute a Data Processing Agreement setting out the applicable terms.</Clause>
          <Clause letter="c">Partner may not use End Customer data obtained through the Platform for any purpose other than providing services to that End Customer or as otherwise agreed in writing with GuildMark.</Clause>
        </Section>

        <Section n={8} title="Confidentiality">
          <Clause letter="a">"Confidential Information" means any non-public information disclosed by one party to the other that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information, including pricing models, business strategies, customer lists, API credentials, and technical architectures.</Clause>
          <Clause letter="b">Each party agrees to: (i) hold the other's Confidential Information in strict confidence; (ii) not disclose Confidential Information to third parties without prior written consent; and (iii) use Confidential Information only as necessary to perform its obligations under this Agreement.</Clause>
          <Clause letter="c">These obligations survive termination of this Agreement for three (3) years.</Clause>
          <Clause letter="d">Confidential Information does not include information that is or becomes publicly known through no fault of the receiving party, was already known prior to disclosure, or is independently developed without reference to the Confidential Information.</Clause>
        </Section>

        <Section n={9} title="Term and Termination">
          <Clause letter="a">This Agreement commences on the date specified in the Partner Schedule and continues for an initial term of twelve (12) months, unless a different term is specified in the Partner Schedule.</Clause>
          <Clause letter="b">After the initial term, this Agreement automatically renews for successive twelve (12) month periods unless either party provides written notice of non-renewal at least sixty (60) days before the end of the then-current term.</Clause>
          <Clause letter="c">Either party may terminate this Agreement for cause upon thirty (30) days' written notice if the other party materially breaches this Agreement and fails to cure within the notice period.</Clause>
          <Clause letter="d">GuildMark may terminate this Agreement immediately upon written notice if Partner: (i) becomes insolvent or files for bankruptcy; (ii) engages in fraudulent or illegal activity; or (iii) breaches the confidentiality or intellectual property provisions.</Clause>
          <Clause letter="e">Upon termination, GuildMark will pay any outstanding revenue share amounts within thirty (30) days. Sections 6, 7, 8, 10, and 11 survive termination.</Clause>
        </Section>

        <Section n={10} title="Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NEITHER PARTY SHALL BE LIABLE FOR
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. GUILDMARK'S TOTAL
            LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE GREATER OF (A) REVENUE SHARE PAYMENTS
            MADE TO PARTNER IN THE TWELVE MONTHS PRECEDING THE CLAIM OR (B) $5,000.
          </p>
          <p>
            THESE LIMITATIONS DO NOT APPLY TO BREACHES OF CONFIDENTIALITY OBLIGATIONS OR INFRINGEMENT
            OF INTELLECTUAL PROPERTY RIGHTS.
          </p>
        </Section>

        <Section n={11} title="General Provisions">
          <Clause letter="a"><strong>Governing Law:</strong> This Agreement is governed by the laws of the State of Florida. Disputes shall be resolved by binding arbitration administered by JAMS in Orange County, Florida.</Clause>
          <Clause letter="b"><strong>Independent Contractors:</strong> The parties are independent contractors. Nothing in this Agreement creates an employment, agency, joint venture, or franchise relationship.</Clause>
          <Clause letter="c"><strong>Assignment:</strong> Partner may not assign this Agreement without GuildMark's prior written consent. GuildMark may assign this Agreement in connection with a merger, acquisition, or sale of substantially all its assets.</Clause>
          <Clause letter="d"><strong>Entire Agreement:</strong> This Agreement (including the Partner Schedule and any incorporated schedules) constitutes the entire agreement between the parties regarding the subject matter hereof and supersedes all prior agreements, representations, and understandings.</Clause>
          <Clause letter="e"><strong>Amendments:</strong> This Agreement may only be amended by a written instrument signed by authorized representatives of both parties.</Clause>
          <Clause letter="f"><strong>Waiver:</strong> Failure to enforce any provision of this Agreement shall not constitute a waiver of future enforcement.</Clause>
        </Section>

        <Section n={12} title="Contact">
          <p>Partner program inquiries: <a href="mailto:partners@guildmark.co" className="text-primary hover:underline">partners@guildmark.co</a></p>
        </Section>

      </div>
    </div>
  );
}
