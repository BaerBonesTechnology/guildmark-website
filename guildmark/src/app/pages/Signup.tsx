import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { SignupRequest } from "../models/auth";
import { CheckCircle2, DollarSign, Shield, Truck } from "lucide-react";

export function Signup() {
  const [formData, setFormData] = useState({
    company: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const signUpReq: SignupRequest = {
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      company_name: formData.company,
      company_size: null,
      industry:  null,
    };

    signup(signUpReq);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8 items-start">
        {/* Left: Sign Up Form */}
        <Card className="font-mono">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>Start managing and trading IT assets today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  type="text"
                  placeholder="Guildmark Enterpises, LLC"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Work Email</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="font-mono"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono">
                Create Account - Free Forever
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p className="font-mono">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#3B82F6] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right: Pricing & Benefits */}
        <div className="space-y-6">
          {/* Free Forever Badge */}
          <Card className="bg-gradient-to-br from-[#3B82F6]/10 to-background border-[#3B82F6]/30 font-mono">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xl font-bold">
                  $0
                </div>
                <div>
                  <h3 className="text-xl mb-2">Free Account Forever</h3>
                  <p className="text-sm text-muted-foreground">
                    No monthly fees, no subscription charges, no hidden costs. Only pay when you sell.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transparent Pricing */}
          <Card className="font-mono">
            <CardHeader>
              <CardTitle>Simple, Transparent Pricing</CardTitle>
              <CardDescription>Only pay when you successfully sell assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="font-semibold">Platform Fee</h4>
                    <span className="text-lg text-[#3B82F6]">8%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Percentage of final sale price. Covers marketplace, payments, and customer support.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="font-semibold">Data Wipe Service</h4>
                    <span className="text-lg text-[#3B82F6]">$8 <span className="text-xs text-muted-foreground">/asset</span></span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Optional service. Ship to our Orlando facility → Get paid on arrival → We wipe data & deliver to buyer.
                    NIST 800-88 certified with compliance certificates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="font-semibold">Shipping Fee</h4>
                    <span className="text-lg text-[#3B82F6]">Actual Cost</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    To Orlando facility (with data wipe) or direct to buyer (without). Prepaid labels for 1-5 units, pallet pickup for 6+.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example Calculation */}
          <Card className="font-mono bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Example: Selling 10 MacBook Pros</CardTitle>
              <CardDescription className="text-xs">With data wipe service (paid on Orlando arrival)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Value (10 × $1,800)</span>
                <span className="font-semibold">$18,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (8%)</span>
                <span className="text-red-500">-$1,440</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Wipe Service (10 × $8)</span>
                <span className="text-red-500">-$80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping to Orlando</span>
                <span className="text-red-500">-$120</span>
              </div>
              <div className="pt-2 border-t flex justify-between">
                <span className="font-semibold">Paid on Arrival</span>
                <span className="text-xl text-[#3B82F6] font-semibold">$16,360</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t">
                ✓ We handle data wipe & delivery to buyer<br/>
                ✓ You're paid immediately upon arrival<br/>
                *Without service: Ship direct to buyer for $16,440
              </p>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card className="font-mono">
            <CardHeader>
              <CardTitle className="text-base">What's Included Free</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Real-time depreciation analytics",
                "Fleet efficiency dashboard",
                "Unlimited marketplace listings",
                "Bulk CSV asset upload",
                "Offer management system",
                "NIST compliance certificates",
                "Prepaid shipping labels",
                "5-day payment processing",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
