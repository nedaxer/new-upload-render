import { useState } from "react";
import { Link } from "wouter";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This would typically connect to your authentication backend
    // For now, just show a success toast
    if (email && password) {
      toast({
        title: "Logged in successfully",
        description: "Welcome back to Nadex cryptocurrency trading platform.",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout
      title="Account Login"
      subtitle="Access your Nadex cryptocurrency trading account"
      bgColor="#f8f9fa"
    >
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/account/forgot-password" className="text-sm text-[#0033a0] hover:text-[#ff5900]">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#0033a0] hover:bg-[#002680]"
          >
            Sign In
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/account/register" className="text-[#0033a0] hover:text-[#ff5900] font-semibold">
              Create Account
            </Link>
          </p>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <p className="text-sm text-center text-gray-600 mb-4">
            Get our mobile app for trading on the go
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://apps.apple.com/us/app/nadex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              iOS App
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.nadex.touch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.792 12 3.609 22.186c-.18.129-.203.342-.114.536.416.823 1.14 1.301 1.988 1.301.686 0 1.283-.334 1.731-.784l10.586-10.586c.254-.254.38-.578.382-.92v-.106c-.002-.343-.128-.666-.382-.92L7.214 1.12C6.762.665 6.155.312 5.483.312c-.847 0-1.572.48-1.988 1.301-.089.194-.068.408.114.536v-.335z" />
              </svg>
              Android App
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}