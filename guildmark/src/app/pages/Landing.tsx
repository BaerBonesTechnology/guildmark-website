import { Link } from "react-router";
import { TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle2, Cloud, FileText, Sparkles } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function Landing() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="pt-12 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-sans text-primary">B2B Asset Trading Platform</span>
          </div>

          <h1 className="text-6xl font-sans tracking-tight">
            Turn Idle Hardware Into
            <span className="block text-primary mt-2">Liquid Capital</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-sans">
            The financial terminal for IT asset management. Track depreciation, predict value cliffs,
            and trade hardware on the B2B marketplace—all in real-time.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-sans">
              <Link to="/signup">
                Start Free Forever
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-sans">
              <Link to="/marketplace">
                Browse Marketplace
              </Link>
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>3,240+ Assets Listed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>$4.3M Market Value</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>NIST Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-sans">Why CFOs Choose GuildMark</h2>
          <p className="text-muted-foreground font-sans">Enterprise-grade tools for hardware lifecycle optimization</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="font-sans">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">Real-Time Depreciation Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Predict "value cliffs" before they hit. Our AI tracks market demand and warns you when
                hardware is about to lose resale value.
              </p>
            </CardContent>
          </Card>

          <Card className="font-sans">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">B2B Marketplace</h3>
              <p className="text-sm text-muted-foreground">
                Buy and sell enterprise hardware directly with other businesses. Verified sellers,
                transparent pricing, and bulk discounts.
              </p>
            </CardContent>
          </Card>

          <Card className="font-sans">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">Compliant Data Wiping</h3>
              <p className="text-sm text-muted-foreground">
                NIST 800-88 certified data destruction with downloadable certificates for legal/audit compliance.
              </p>
            </CardContent>
          </Card>

          <Card className="font-sans">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">Frictionless Offload</h3>
              <p className="text-sm text-muted-foreground">
                Generate prepaid shipping labels or schedule pallet pickups. We handle logistics,
                wiping, and payment—you just approve.
              </p>
            </CardContent>
          </Card>

          <Card className="font-sans">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">GuildMark Score</h3>
              <p className="text-sm text-muted-foreground">
                Every asset gets a GuildMark Score — a live rating based on condition, age, and market demand
                so buyers and sellers always know what something is worth.
              </p>
            </CardContent>
          </Card>

          <Card className="font-sans">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">Transparent Pricing</h3>
              <p className="text-sm text-muted-foreground">
                See exactly what you'll receive after shipping, data wiping, and platform fees.
                No hidden costs or surprises.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-sans">How It Works</h2>
          <p className="text-muted-foreground font-sans">Two flexible workflows - choose what works for you</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-sans text-xl">
              1
            </div>
            <Card className="font-sans pt-8">
              <CardContent className="space-y-3">
                <h3 className="text-lg">Upload Your Inventory</h3>
                <p className="text-sm text-muted-foreground">
                  Bulk upload via CSV or manually enter asset details. Our AI instantly calculates current
                  market value and depreciation trajectory.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-sans text-xl">
              2
            </div>
            <Card className="font-sans pt-8">
              <CardContent className="space-y-3">
                <h3 className="text-lg">Choose Your Path</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>With data wipe:</strong> Ship to Orlando → Paid on arrival → We handle rest<br/>
                  <strong>Without:</strong> Ship direct to buyer → You handle wipe
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-sans text-xl">
              3
            </div>
            <Card className="font-sans pt-8">
              <CardContent className="space-y-3">
                <h3 className="text-lg">Get Paid Fast</h3>
                <p className="text-sm text-muted-foreground">
                  With data wipe service: Immediate payment when assets arrive. Without: Payment on buyer confirmation.
                  Compliance certificates included with all sales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center pt-4">
          <Button asChild variant="outline" size="lg" className="font-sans">
            <Link to="/how-it-works">
              View Detailed Workflows
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* GM Pro Upsell */}
      <section className="bg-gradient-to-br from-amps-accent/10 via-amps-highlight/5 to-background border-2 border-amps-accent/30 rounded-xl p-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amps-accent to-amps-highlight">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-sans text-white font-semibold">GM Pro</span>
            </div>
            <h2 className="text-4xl font-sans">
              GuildMark Portfolio
            </h2>
            <p className="text-xl text-muted-foreground font-sans max-w-2xl mx-auto">
              Beyond marketplace trading — full MDM integration, automated valuations, invoice generation,
              and real-time portfolio analytics for IT finance teams.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="border-amps-accent/30">
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-sans font-semibold">MDM Sync</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  Connect Jamf Pro, Jamf School, or Microsoft Intune. Automatically sync device inventory
                  and condition data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-amps-accent/30">
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-sans font-semibold">Portfolio Analytics</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  Track portfolio value over time, depreciation curves, and identify at-risk assets
                  before value cliffs hit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-amps-accent/30">
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-sans font-semibold">Invoice Generation</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  Generate write-off invoices for sales, disposals, losses, and donations with
                  market value documentation.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-amps-accent to-amps-highlight hover:from-amps-accent/90 hover:to-amps-highlight/90 text-white font-sans">
              <Link to="/signup">
                Start GM Pro Trial
                <Sparkles className="w-4 h-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground font-sans mt-3">
              Starting at $49/month • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/10 to-background border border-primary/20 rounded-xl p-12 text-center space-y-6">
        <h2 className="text-3xl font-sans">Ready to Optimize Your IT Assets?</h2>
        <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
          Join hundreds of businesses turning depreciation into opportunity. Free forever, only pay when you sell.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-sans">
            <Link to="/signup">
              Get Started Free
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-sans">
            <Link to="/login">
              Sign In
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
