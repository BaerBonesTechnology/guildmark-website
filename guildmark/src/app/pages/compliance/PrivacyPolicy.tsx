/**
 * GuildMark Privacy Policy
 */

function Section({ n, title, children }: { n?: string | number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold font-mono">
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
      <span className="text-[#3B82F6] shrink-0 mt-1">–</span>
      <p>{children}</p>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-mono text-[#3B82F6] uppercase tracking-widest">Legal</p>
        <h1 className="text-3xl font-bold font-mono">Privacy Policy</h1>
        <p className="text-sm font-mono text-muted-foreground">
          Effective Date: January 1, 2025 · Last Updated: May 1, 2025
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Baerhous Media Group, LLC, operating as GuildMark™ ("<strong>GuildMark</strong>") is committed
          to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and
          safeguard information when you use the GuildMark platform and related services.
        </p>
      </div>

      <hr className="border-border" />

      <div className="space-y-8">

        <Section n={1} title="Information We Collect">
          <p><strong>Information you provide directly:</strong></p>
          <Bullet>Account registration data: company name, full name, work email address, password (hashed).</Bullet>
          <Bullet>Asset data: hardware make, model, serial numbers, condition, purchase price, and related records you upload or sync.</Bullet>
          <Bullet>Listing information: hardware descriptions, photographs, asking prices, and transaction history.</Bullet>
          <Bullet>Communications: messages sent through our offer inbox, support tickets, and emails to our team.</Bullet>
          <Bullet>Waitlist and partner interest submissions: name, company, email, and stated business type.</Bullet>
          <p><strong>Information collected automatically:</strong></p>
          <Bullet>Log data: IP address, browser type, pages visited, and timestamps.</Bullet>
          <Bullet>Usage data: features used, search queries, and interaction patterns.</Bullet>
          <Bullet>Cookies: session cookies for authentication and preference cookies for theme and language settings.</Bullet>
          <p><strong>Information from third parties:</strong></p>
          <Bullet>MDM integrations (Jamf Pro, Jamf School, Microsoft Intune): hardware inventory data you authorize us to sync.</Bullet>
          <Bullet>Escrow.com: transaction status and payment confirmation signals. We do not receive your full payment card or bank account details.</Bullet>
        </Section>

        <Section n={2} title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <Bullet>Provide, operate, and improve the GuildMark platform and Services;</Bullet>
          <Bullet>Process marketplace transactions and facilitate escrow payments;</Bullet>
          <Bullet>Generate asset valuations using market data and AI models;</Bullet>
          <Bullet>Communicate with you about your account, transactions, and platform updates;</Bullet>
          <Bullet>Detect, investigate, and prevent fraudulent or unauthorized activity;</Bullet>
          <Bullet>Comply with legal obligations; and</Bullet>
          <Bullet>Analyze usage patterns to improve platform performance and user experience.</Bullet>
        </Section>

        <Section n={3} title="How We Share Your Information">
          <p>We do not sell your personal information. We may share your information with:</p>
          <Bullet><strong>Other users:</strong> Your company name and relevant transaction details are visible to counterparties as necessary to complete transactions. Personal contact details are not shared without your consent.</Bullet>
          <Bullet><strong>Service providers:</strong> Escrow.com, cloud infrastructure providers, email delivery services, and analytics tools. These providers are contractually prohibited from using your data for other purposes.</Bullet>
          <Bullet><strong>Legal and regulatory:</strong> When required by law, court order, or governmental authority.</Bullet>
          <Bullet><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, subject to confidentiality obligations.</Bullet>
        </Section>

        <Section n={4} title="Data Retention">
          <p>
            We retain your account data for as long as your account is active. If you close your account,
            we will delete or anonymize your personal information within 90 days, except where we are
            required to retain it for legal, regulatory, tax, or audit purposes.
          </p>
          <p>
            Transaction records are retained for a minimum of seven (7) years in compliance with applicable
            financial record-keeping requirements.
          </p>
        </Section>

        <Section n={5} title="Your Rights">
          <p>You may have the right to access, correct, delete, or export your personal information. To exercise these rights, contact us at{" "}
            <a href="mailto:privacy@guildmark.co" className="text-[#3B82F6] hover:underline">privacy@guildmark.co</a>.
            We will respond within 30 days.
          </p>
        </Section>

        <Section n={6} title="Security">
          <p>
            We implement industry-standard security measures including TLS encryption in transit, encrypted
            storage of sensitive data, hashed passwords, and access controls. No method of transmission
            over the Internet is 100% secure. We will notify affected users without undue delay in the
            event of a data breach.
          </p>
        </Section>

        <Section n={7} title="Contact">
          <p>
            Privacy questions should be directed to{" "}
            <a href="mailto:privacy@guildmark.co" className="text-[#3B82F6] hover:underline">privacy@guildmark.co</a>
            {" "}or to Baerhous Media Group, LLC, Attention: Privacy, Orlando, Florida, USA.
          </p>
        </Section>

      </div>
    </div>
  );
}
