/**
 * GuildMark Privacy Policy
 *
 * Keep every claim in this document consistent with what the platform
 * actually does. Cross-references: CookieBanner.tsx (consent storage),
 * api/migrations (data actually collected), api/bin/lib/services
 * (third-party processors). Draft — requires attorney review before launch.
 */

function Section({ n, title, children }: { n?: string | number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold ">
        {n !== undefined ? `${n}. ` : ""}{title}
      </h2>
      <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 pl-2">
      <span className="text-primary shrink-0 mt-1">–</span>
      <p>{children}</p>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs  text-primary uppercase tracking-widest">Legal</p>
        <h1 className="text-3xl font-bold ">Privacy Policy</h1>
        <p className="text-sm  text-muted-foreground">
          Effective Date: July 7, 2026 · Last Updated: July 7, 2026
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Baerhous Media Group, LLC, operating as GuildMark™ ("<strong>GuildMark</strong>") is committed
          to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and
          safeguard information when you use the GuildMark platform and related services. GuildMark is
          a business-to-business service; the information we process is primarily business information,
          but it includes personal information about the people who use the platform on a business's
          behalf.
        </p>
      </div>

      <hr className="border-border" />

      <div className="space-y-8">

        <Section n={1} title="Information We Collect">
          <p><strong>Information you provide directly:</strong></p>
          <Bullet>Account registration data: company name, company size and industry, your full name, work email address, and password (stored only as a cryptographic hash).</Bullet>
          <Bullet>Asset data: hardware make, model, serial numbers, condition, purchase price, and related records you upload or sync. Where you sync from an MDM, asset records may include employee assignment details (assigned user, department, cost center) that you choose to share with us.</Bullet>
          <Bullet>Listing information: hardware descriptions, photographs, asking prices, and transaction history.</Bullet>
          <Bullet>Communications: messages sent through our offer inbox, support tickets, and emails to our team.</Bullet>
          <Bullet>Waitlist and interest submissions: name, company, email, and stated business type.</Bullet>
          <Bullet>Partner applications: company name, contact email, city, state, and service area, submitted by refurbishment and logistics partners applying to join our partner network.</Bullet>
          <p><strong>Information collected automatically:</strong></p>
          <Bullet>Server logs: IP address, browser user agent, requested pages, and timestamps, used for security monitoring and debugging.</Bullet>
          <Bullet>An essential authentication cookie (an httpOnly session refresh token) required to keep you signed in.</Bullet>
          <Bullet>Browser local storage: your theme preference, language preference, and cookie-consent choice (stored under the key <code>gm.cookieConsent</code>). See Section 6.</Bullet>
          <p><strong>Information from third parties:</strong></p>
          <Bullet>MDM integrations (Jamf Pro, Jamf School, Microsoft Intune): hardware inventory data you authorize us to sync.</Bullet>
          <Bullet>Square: payment confirmations and customer/subscription identifiers. Your full payment card details never touch our servers (see Section 3).</Bullet>
          <Bullet>Escrow.com: transaction status and payment confirmation signals. We do not receive your full payment card or bank account details.</Bullet>
          <Bullet>FedEx: shipment tracking events for orders in transit.</Bullet>
        </Section>

        <Section n={2} title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <Bullet>Provide, operate, and improve the GuildMark platform and Services;</Bullet>
          <Bullet>Process marketplace transactions, payments, and escrow;</Bullet>
          <Bullet>Arrange shipping and provide tracking for marketplace orders;</Bullet>
          <Bullet>Generate asset valuations using market data and machine-learning models;</Bullet>
          <Bullet>Verify businesses and partners before granting marketplace or partner access (see Section 4);</Bullet>
          <Bullet>Communicate with you about your account, transactions, and platform updates;</Bullet>
          <Bullet>Detect, investigate, and prevent fraudulent or unauthorized activity, using server logs among other signals;</Bullet>
          <Bullet>Comply with legal obligations.</Bullet>
        </Section>

        <Section n={3} title="Payment Information">
          <p>
            GuildMark does not store payment card numbers or bank account details on its own systems.
          </p>
          <Bullet><strong>Square</strong> processes card payments and subscription billing. When your company registers, we create a customer record with Square containing your company name and email address; payment history, invoices, and any cards you choose to save on file are held by Square, not by GuildMark. We store only the Square customer and subscription identifiers needed to reference your account. Cards are saved on file only with your consent.</Bullet>
          <Bullet><strong>Escrow.com</strong> holds and disburses funds for escrow-protected marketplace transactions. We receive transaction status signals, not your payment credentials.</Bullet>
        </Section>

        <Section n={4} title="Business and Partner Verification">
          <p>
            Because GuildMark is a B2B marketplace, we verify that accounts represent real businesses.
          </p>
          <Bullet><strong>What we collect:</strong> the company details you provide at registration (company name, size, industry) and, for partner-network applicants, the application details described in Section 1. We may request additional documentation to verify business status before approving marketplace or partner access.</Bullet>
          <Bullet><strong>Who sees it:</strong> verification data is reviewed by authorized GuildMark employees through our internal administration tools, under role-based access controls. It is not visible to other users beyond what Section 5 describes.</Bullet>
          <Bullet><strong>Retention:</strong> verification records are retained for as long as your account or partner relationship is active, and afterwards only as required for legal, audit, or fraud-prevention purposes.</Bullet>
          <Bullet><strong>Legal basis:</strong> performance of our contract with you, our legitimate interests in preventing fraud and maintaining marketplace integrity, and compliance with legal obligations.</Bullet>
        </Section>

        <Section n={5} title="How We Share Your Information">
          <p>We do not sell your personal information. We share information only as described below:</p>
          <Bullet><strong>Other users:</strong> Your company name and relevant transaction details are visible to counterparties as necessary to complete transactions. Personal contact details are not shared without your consent.</Bullet>
          <Bullet><strong>Payment processors:</strong> Square (card payments and subscriptions) and Escrow.com (escrow transactions), as described in Section 3.</Bullet>
          <Bullet><strong>Shipping:</strong> FedEx receives names, company names, addresses, and contact details as needed to generate shipping labels and deliver marketplace orders.</Bullet>
          <Bullet><strong>Email delivery:</strong> Resend delivers our transactional emails (account, order, and password-reset messages) and receives recipient email addresses and message content for that purpose.</Bullet>
          <Bullet><strong>Certified partners:</strong> where an order includes data sanitization, reimaging, or logistics services, the assigned partner receives the order reference, buyer company name and city, and device counts needed to perform the work — not personal contact details of individual users.</Bullet>
          <Bullet><strong>Hosting and infrastructure:</strong> our services run on Google Cloud Platform. Supporting backend services run on Appwrite software self-hosted on our own infrastructure — Appwrite (the company) does not receive your data.</Bullet>
          <Bullet><strong>Market data services:</strong> we query eBay and Back Market for market pricing used in valuations. Only device model and specification data is sent to these services — never your personal information.</Bullet>
          <Bullet><strong>Legal and regulatory:</strong> when required by law, court order, or governmental authority.</Bullet>
          <Bullet><strong>Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, subject to confidentiality obligations.</Bullet>
          <p>Service providers are contractually prohibited from using your data for their own purposes.</p>
        </Section>

        <Section n={6} title="Cookies and Local Storage">
          <p>
            GuildMark uses an essential-only cookie footprint. We set a single strictly-necessary
            httpOnly cookie to keep you signed in, and we store functional preferences (theme,
            language, and your cookie-consent choice) in your browser's local storage under the key{" "}
            <code>gm.cookieConsent</code>.
          </p>
          <Bullet>We do not use analytics, advertising, or tracking cookies or scripts, and no third-party trackers run on the platform.</Bullet>
          <Bullet>We do not sell personal information or share it for cross-context behavioral advertising.</Bullet>
          <Bullet>If we introduce optional analytics in the future, they will remain off unless you have opted in through the cookie banner, and you will be re-prompted if our cookie practices change.</Bullet>
          <Bullet>You can clear the essential cookie and local-storage entries at any time through your browser settings; doing so signs you out and resets your preferences.</Bullet>
        </Section>

        <Section n={7} title="Data Retention">
          <p>
            We retain your account data for as long as your account is active. If you close your account,
            we will delete or anonymize your personal information within 90 days, except where we are
            required to retain it for legal, regulatory, tax, or audit purposes.
          </p>
          <p>
            Transaction records are retained for a minimum of seven (7) years in compliance with applicable
            financial record-keeping requirements. Verification records are retained as described in
            Section 4.
          </p>
        </Section>

        <Section n={8} title="Security">
          <p>We implement industry-standard security measures, including:</p>
          <Bullet>TLS encryption for data in transit;</Bullet>
          <Bullet>Passwords stored only as cryptographic hashes;</Bullet>
          <Bullet>MDM credentials encrypted at rest with authenticated encryption (AES-GCM), with keys held outside the database;</Bullet>
          <Bullet>Session tokens delivered in httpOnly cookies inaccessible to page scripts;</Bullet>
          <Bullet>Role-based access controls for GuildMark staff, with administrative access protected by hardware-backed passkey (WebAuthn) authentication as a second factor. Passkeys store only public keys on our servers — biometric data never leaves the employee's device.</Bullet>
          <p>
            No method of transmission over the Internet is 100% secure. We will notify affected users
            without undue delay in the event of a data breach affecting their personal information.
          </p>
        </Section>

        <Section n={9} title="Your Rights and Choices">
          <p>
            Depending on where you are located, you may have the right to access, correct, delete, or
            export your personal information, and to object to or restrict certain processing. To
            exercise these rights, contact us at{" "}
            <a href="mailto:privacy@guildmark.co" className="text-primary hover:underline">privacy@guildmark.co</a>.
            We will verify your request and respond within 30 days.
          </p>
          <p>
            <strong>Legal bases (GDPR).</strong> Where the EU or UK General Data Protection Regulation
            applies, we process personal data on the following bases: performance of our contract with
            you (operating your account and transactions); our legitimate interests (securing the
            platform, preventing fraud, and improving the Services); your consent (where you opt in,
            such as saving a card on file or accepting optional cookies); and compliance with legal
            obligations (tax and financial record-keeping). You may lodge a complaint with your local
            supervisory authority.
          </p>
          <p>
            <strong>California residents (CCPA/CPRA).</strong> We do not sell personal information and
            we do not share it for cross-context behavioral advertising. California residents have the
            right to know what personal information we collect (described in Section 1), to access and
            delete it, to correct inaccurate information, and to not be discriminated against for
            exercising these rights. Requests may be submitted to the email above, including through an
            authorized agent.
          </p>
        </Section>

        <Section n={10} title="International Users">
          <p>
            GuildMark is operated from the United States, and information we collect is processed and
            stored in the United States. If you access the Services from outside the United States, you
            understand that your information will be transferred to and processed in the United States,
            where data-protection laws may differ from those of your jurisdiction.
          </p>
        </Section>

        <Section n={11} title="Children">
          <p>
            The Services are a business-to-business platform intended for users 18 years of age or
            older. We do not knowingly collect personal information from children.
          </p>
        </Section>

        <Section n={12} title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Material changes will be announced on
            the platform or by email, and the "Last Updated" date above will be revised. Your continued
            use of the Services after changes take effect constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section n={13} title="Contact">
          <p>
            Privacy questions should be directed to{" "}
            <a href="mailto:privacy@guildmark.co" className="text-primary hover:underline">privacy@guildmark.co</a>
            {" "}or to Baerhous Media Group, LLC, Attention: Privacy, Orlando, Florida, USA.
          </p>
        </Section>

      </div>
    </div>
  );
}
