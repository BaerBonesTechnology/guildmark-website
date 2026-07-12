/** Signup story panel — value prop, AMPS/marketplace cards, pricing, trust. */
import { Layers, Store } from "lucide-react";
import { FeatureItem } from "./FeatureItem";
import { Step } from "./Step";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { HOW_IT_WORKS_STEPS, pricingTiles, TRUST_SIGNALS } from "../../constants/signup.constants";
import { ampsEnabled } from "../../config";

export function PlatformStory({ freeFee }: { freeFee: string }) {
  return (
    <div className="space-y-5">

      {/* Value prop */}
      <div className="space-y-1">
        <h2 className="text-2xl ">The IT asset platform built for IT teams</h2>
        <p className="text-sm text-muted-foreground ">
          GuildMark combines a fleet management suite with a B2B hardware marketplace —
          so you can track what you have, know what it's worth, and sell it when you're ready.
        </p>
      </div>

      {ampsEnabled && <>
        {/* AMPS */}
        <Card className="">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AMPS — Asset Management & Portfolio System</h3>
                <p className="text-xs text-muted-foreground">Your fleet command centre</p>
              </div>
            </div>
            <ul className="space-y-2">
              <FeatureItem>
                <strong>Depreciation analytics</strong> — real-time value tracking and AI-powered "value cliff" warnings before hardware loses resale value
              </FeatureItem>
              <FeatureItem>
                <strong>MDM sync</strong> — pull your fleet directly from Jamf Pro, Jamf School, or Microsoft Intune
              </FeatureItem>
              <FeatureItem>
                <strong>Portfolio overview</strong> — total fleet value, condition breakdown, and per-asset valuations in one dashboard
              </FeatureItem>
              <FeatureItem>
                <strong>CSV bulk import</strong> — upload hundreds of assets at once; we calculate market value automatically
              </FeatureItem>
              <FeatureItem>
                <strong>Invoice generation</strong> — produce tax invoices for every sale directly from the platform
              </FeatureItem>
            </ul>
          </CardContent>
        </Card>
      </>}

      {/* Marketplace */}
      <Card className="">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">B2B Marketplace</h3>
              <p className="text-xs text-muted-foreground">Hardware trading between verified businesses</p>
            </div>
          </div>
          <ul className="space-y-2">
            <FeatureItem>
              <strong>List instantly</strong> — push assets from AMPS to the marketplace in one click with AI-priced listings
            </FeatureItem>
            <FeatureItem>
              <strong>Offer management</strong> — receive, counter, and accept buyer offers with a full negotiation inbox
            </FeatureItem>
            <FeatureItem>
              <strong>Escrow payments</strong> — every transaction is secured through Escrow.com; funds held until delivery is confirmed
            </FeatureItem>
            <FeatureItem>
              <strong>Optional data wipe</strong> — ship to our Orlando facility, get paid on arrival, we handle NIST 800-88 certified wiping and delivery to the buyer
            </FeatureItem>
            <FeatureItem>
              <strong>Prepaid shipping</strong> — labels for 1–5 units or pallet pickup for 6+; or ship direct to the buyer yourself
            </FeatureItem>
          </ul>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <Step key={step.num} num={step.num} title={step.title} body={step.body} />
          ))}
        </CardContent>
      </Card>

      {/* Pricing summary */}
      <Card className=" border-primary/20 bg-primary/5">
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl  font-bold text-primary">$0</span>
            <span className="text-sm text-muted-foreground">to get started — no subscription, ever</span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            {pricingTiles(freeFee).map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center space-y-1">
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-xs font-semibold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust signals */}
      <div className="flex flex-wrap gap-3">
        {TRUST_SIGNALS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5 text-xs  text-muted-foreground bg-muted/50 border rounded-full px-3 py-1.5">
            <Icon className="w-3.5 h-3.5 text-primary" />
            {text}
          </div>
        ))}
      </div>

    </div>
  );
}
