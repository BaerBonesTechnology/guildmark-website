import { Package, MapPin, Shield, DollarSign, Truck, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function HowItWorks() {
  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-mono">Two Ways to Sell</h1>
        <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
          Choose the workflow that works best for your business
        </p>
      </div>

      {/* With Data Wipe Service */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-mono">Option 1: With Data Wipe Service</h2>
            <p className="text-sm text-muted-foreground font-mono">
              Fastest payment, zero liability, compliance included (+$8/asset)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="font-mono">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-2">
                1
              </div>
              <CardTitle className="text-base">List Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Upload inventory</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Set pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Enable data wipe</span>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-2">
                2
              </div>
              <CardTitle className="text-base">Ship to Orlando</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Our facility address</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Prepaid labels</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Pallet pickup (6+)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-2">
                3
              </div>
              <CardTitle className="text-base">Get Paid Instantly</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>Payment on arrival</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>You're done!</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Zero liability</span>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-2">
                4
              </div>
              <CardTitle className="text-base">We Handle Rest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>NIST 800-88 wipe</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Ship to buyer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Compliance certs</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50 font-mono">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Best for: Corporate IT departments prioritizing speed & compliance</p>
                <p className="text-sm text-muted-foreground">
                  You're paid immediately when assets arrive in Orlando. We handle all data destruction,
                  compliance documentation, and delivery to buyer. Zero delivery liability after shipment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Without Data Wipe Service */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-600 text-white flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-mono">Option 2: Direct to Buyer</h2>
            <p className="text-sm text-muted-foreground font-mono">
              Handle your own data wipe, ship directly to buyer (no service fee)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="font-mono">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-slate-600/10 text-slate-600 flex items-center justify-center text-xl font-bold mb-2">
                1
              </div>
              <CardTitle className="text-base">List & Sell</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Create listing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept offer</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Wipe data yourself</span>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-slate-600/10 text-slate-600 flex items-center justify-center text-xl font-bold mb-2">
                2
              </div>
              <CardTitle className="text-base">Ship to Buyer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Buyer's address</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Your shipping choice</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Track delivery</span>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-slate-600/10 text-slate-600 flex items-center justify-center text-xl font-bold mb-2">
                3
              </div>
              <CardTitle className="text-base">Buyer Confirms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Buyer receives</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Payment released</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Transaction complete</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50 font-mono">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-slate-600 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Best for: Companies with existing data wipe processes</p>
                <p className="text-sm text-muted-foreground">
                  Save $8/asset if you already have NIST-compliant data destruction. Ship directly to buyer.
                  Payment released upon buyer confirmation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
