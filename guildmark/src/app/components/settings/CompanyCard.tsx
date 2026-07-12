/** Company Information card in Account Settings. */
import { Building2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { CompanyForm } from "../../viewmodels/useAccountSettingsViewModel";

interface CompanyCardProps {
  company: CompanyForm;
  setCompany: (company: CompanyForm) => void;
}

export function CompanyCard({ company, setCompany }: CompanyCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="">Company Information</CardTitle>
            <CardDescription className="">
              Details about your organization
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="">Company Name</Label>
          <Input
            value={company.name}
            onChange={(e) => setCompany({ ...company, name: e.target.value })}
            className=""
            placeholder="Acme Corp"
          />
        </div>
        <div className="space-y-2">
          <Label className="">Business Address</Label>
          <Input
            value={company.address}
            onChange={(e) => setCompany({ ...company, address: e.target.value })}
            className=""
            placeholder="123 Main St, San Francisco, CA 94102"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="">Industry</Label>
            <Input
              value={company.industry}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              className=""
              placeholder="Technology"
            />
          </div>
          <div className="space-y-2">
            <Label className="">Company Size</Label>
            <Input
              value={company.size}
              onChange={(e) => setCompany({ ...company, size: e.target.value })}
              className=""
              placeholder="100–500 employees"
            />
          </div>
        </div>
        <div className="pt-2">
          <Button className="bg-primary hover:bg-primary/90 text-white ">
            Save Company Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
