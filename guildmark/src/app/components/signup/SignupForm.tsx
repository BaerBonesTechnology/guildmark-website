/** Signup registration form card. */
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { SignupForm as SignupFormData } from "../../viewmodels/useSignupViewModel";

interface SignupFormProps {
  error: string | null;
  formData: SignupFormData;
  handleSubmit: (evt: React.FormEvent) => void;
  passwordError: string | null;
  setFormData: (data: SignupFormData) => void;
}

export function SignupForm({ error, formData, handleSubmit, passwordError, setFormData }: SignupFormProps) {
  return (
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
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className=""
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              type="text"
              placeholder="ACME, Inc."
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
  );
}
