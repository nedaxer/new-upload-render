import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon, InfoIcon } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    receiveUpdates: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.acceptTerms) {
      toast({
        title: "Terms not accepted",
        description: "You must accept the terms and conditions to create an account.",
        variant: "destructive",
      });
      return;
    }
    
    // Success - would normally register with backend
    toast({
      title: "Account created successfully",
      description: "Welcome to Nadex cryptocurrency trading platform.",
    });
    
    // Redirect to login page
    setTimeout(() => {
      setLocation("/account/login");
    }, 1500);
  };

  return (
    <PageLayout
      title="Create Account"
      subtitle="Join Nadex cryptocurrency trading platform"
      bgColor="#f8f9fa"
    >
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name<span className="text-red-500">*</span></Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name<span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password<span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password<span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-md flex items-start">
            <InfoIcon className="h-5 w-5 text-[#0033a0] mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-[#0033a0] mb-1">Password Requirements:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>At least 8 characters long</li>
                <li>Include at least one uppercase letter</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="acceptTerms" 
                name="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                }
                className="mt-1"
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm leading-tight"
              >
                I have read and agree to the{" "}
                <Link href="/legal/terms" className="text-[#0033a0] hover:text-[#ff5900]">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-[#0033a0] hover:text-[#ff5900]">
                  Privacy Policy
                </Link>
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="receiveUpdates" 
                name="receiveUpdates"
                checked={formData.receiveUpdates}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, receiveUpdates: checked as boolean }))
                }
                className="mt-1"
              />
              <label
                htmlFor="receiveUpdates"
                className="text-sm leading-tight"
              >
                I would like to receive updates on cryptocurrency market news, trading opportunities, and platform enhancements (optional)
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#0033a0] hover:bg-[#002680]"
          >
            Create Account
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/account/login" className="text-[#0033a0] hover:text-[#ff5900] font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}