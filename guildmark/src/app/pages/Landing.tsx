import { Link } from "react-router";
import { TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle2, Cloud, FileText, Sparkles } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import React, {useState } from 'react';
import {motion } from 'framer-motion';
// Hero Images
import heroImg_Woman from "../../hero-imgs/hero-image-woman.png";
import heroImg_ServerRoom from "../../hero-imgs/hero-image-server-rrom.png";
import heroImg_Floor from "../../hero-imgs/hero-image-floor.png";

export function Landing() {
const [isLoaded, setIsLoaded] = useState(false);

const LayeredFadeImage = ({ src, alt, layer, className }: { src: string; alt: string; layer: number; className?: string }) => {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={`transform transition-transform duration-3000 ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"} z-${layer} absolute -left-8 w-1/2 h-screen object-cover ${className}`}
      initial={{ opacity: 0, x: -32 }}
      animate={isLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: -32 }}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

  return (
    <div className="flex flex-row h-screen overflow-y-clip">
      {/* Hero Section */}
      <section className="w-1/2 h-screen bg-primary/10 flex items-center p-12">
        <div className="absolute inset-0 pointer-events-none top-20">
          <LayeredFadeImage src={heroImg_Woman} alt="Hero Image Woman" layer={1}  />
          <LayeredFadeImage src={heroImg_ServerRoom} alt="Hero Image Server Room" layer={2} />
          <LayeredFadeImage src={heroImg_Floor} alt="Hero Image Floor" layer={3} />
        </div>
        <div className="max-w-4xl mx-auto text-center space-y-8 z-10 text-white">

          <h1 className="text-8xl font-sans tracking-tight font-semibold">
            Find What Your <br/> Business Needs
          </h1>

          <p className="text-xl text-white max-w-2xl mx-auto font-sans">
            Procurement Simplified. Buy, Sell, and Manage Your IT Assets Effortlessly.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-sans">
              <Link to="/pre/signup">
                Start Free Forever
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-sans">
              <Link to="/pre/marketplace">
                Browse Marketplace
              </Link>
            </Button>
          </div>

          {/* <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground font-sans">
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
          </div>*/}
        </div> 
      </section>

      <div className="w-1/2 h-full flex flex-col overflow-y-auto py-8 mx-8 space-y-8 pb-25">
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
        </div>    </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-sans">How It Works</h2>
          <p className="text-muted-foreground font-sans">Two flexible workflows - choose what works for you</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="relative">
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
            <Link to="/pre/how-it-works">
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
              <Link to="/pre/signup">
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
            <Link to="/pre/signup">
              Get Started Free
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-sans">
            <Link to="/pre/login">
              Sign In
            </Link>
          </Button>
        </div>
      </section>

      </div>
    </div>
  );
}
