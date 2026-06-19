import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { usePlatformFees } from "../lib/apiHooks";
import {
  CheckCircle2, TrendingUp, Shield, Truck, Store,
  BarChart2, Layers, Lock, ArrowRight, Zap,
} from "lucide-react";

// ── Small helpers ─────────────────────────────────────────────────────────────

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs  font-bold shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <p className="text-sm font-semibold ">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Signup() {
  const { data: fees } = usePlatformFees();

  // Format a decimal fee rate as a percentage string, falling back while loading.
  const freeFee = fees
    ? `${parseFloat((fees.seller_fee_free * 100).toFixed(2))}%`
    : "—";

  const [formData, setFormData] = useState({
    company:         "",
    fullName:        "",
    email:           "",
    password:        "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await signup({
        email:        formData.email,
        password:     formData.password,
        full_name:    formData.fullName,
        company_name: formData.company,
        company_size: "0",
        industry:     "unknown",
      });
      navigate("/dashboard");
    } catch {
      // error message is surfaced via useAuth's error state below
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* ── Left: Sign Up Form ──────────────────────────────────────────── */}
        <Card className="">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>Start managing and trading IT assets today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="Jamie Williams"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className=""
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  type="text"
                  placeholder="Guildmark Enterprises, LLC"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className=""
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Work Email</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className=""
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className=""
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className=""
                  required
                />
              </div>

              {(error || passwordError) && (
                <p className="text-sm text-red-500 ">{passwordError ?? error}</p>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white ">
                Create Account — Free Forever
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <p className="text-center text-sm text-muted-foreground ">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* ── Right: Platform story ───────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Value prop */}
          <div className="space-y-1">
            <h2 className="text-2xl ">The IT asset platform built for IT teams</h2>
            <p className="text-sm text-muted-foreground ">
              GuildMark combines a fleet management suite with a B2B hardware marketplace —
              so you can track what you have, know what it's worth, and sell it when you're ready.
            </p>
          </div>

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
              <Step
                n={1}
                title="Import your fleet"
                body="Connect your MDM or upload a CSV. GuildMark instantly values every asset against live market data."
              />
              <Step
                n={2}
                title="List what you want to sell"
                body="Push assets to the marketplace. Buyers submit offers — you accept, counter, or decline."
              />
              <Step
                n={3}
                title="Get paid"
                body="With data wipe: ship to Orlando, paid on arrival. Without: ship direct to buyer, payment on delivery confirmation."
              />
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
                {[
                  { icon: BarChart2, label: "Seller fee (free)", value: `${freeFee} on sale` },
                  { icon: Shield,    label: "Data wipe",    value: "Flat rate / asset" },
                  { icon: Truck,     label: "Shipping",     value: "Actual cost" },
                ].map(({ icon: Icon, label, value }) => (
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
            {[
              { icon: Lock,   text: "Escrow-secured payments" },
              { icon: Shield, text: "NIST 800-88 certified" },
              { icon: Zap,    text: "Live market valuations" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs  text-muted-foreground bg-muted/50 border rounded-full px-3 py-1.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
                {text}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
