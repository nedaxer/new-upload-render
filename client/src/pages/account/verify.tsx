import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircleIcon, LockIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";

export default function VerifyAccount() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // On component mount, check URL for userId parameter
  useEffect(() => {
    // Extract userId from the URL hash
    const extractUserIdFromHash = () => {
      const hashParts = window.location.hash.split('?');
      if (hashParts.length > 1) {
        const params = new URLSearchParams(hashParts[1]);
        const userIdParam = params.get('userId');
        if (userIdParam) {
          return parseInt(userIdParam, 10);
        }
      }
      return null;
    };

    // Extract userId from the URL search params (for non-hash navigation)
    const extractUserIdFromSearch = () => {
      const params = new URLSearchParams(window.location.search);
      const userIdParam = params.get('userId');
      if (userIdParam) {
        return parseInt(userIdParam, 10);
      }
      return null;
    };

    // Try to get userId from hash first, then from search params, then from localStorage
    const userIdFromHash = extractUserIdFromHash();
    const userIdFromSearch = extractUserIdFromSearch();
    const storedUserId = localStorage.getItem('unverifiedUserId');
    
    if (userIdFromHash) {
      console.log("Found userId in hash:", userIdFromHash);
      setUserId(userIdFromHash);
    } else if (userIdFromSearch) {
      console.log("Found userId in search params:", userIdFromSearch);
      setUserId(userIdFromSearch);
    } else if (storedUserId) {
      console.log("Found userId in localStorage:", storedUserId);
      setUserId(parseInt(storedUserId, 10));
    } else {
      console.log("No userId found in URL or localStorage");
      // No userId available, redirect to login
      toast({
        title: "Verification error",
        description: "Unable to find your account information. Please login again.",
        variant: "destructive",
      });
      setLocation('/account/login');
    }
  }, [setLocation, toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Verification error",
        description: "Unable to find your account information. Please login again.",
        variant: "destructive",
      });
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code from your email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Verification failed",
          description: data.message || "Failed to verify your account. Please check the code and try again.",
          variant: "destructive",
        });
        return;
      }

      // Show success message
      setVerificationSuccess(true);
      toast({
        title: "Account verified",
        description: "Your account has been successfully verified. You can now access your account.",
      });

      // Clear the stored unverified user ID
      localStorage.removeItem('unverifiedUserId');

      // Redirect to home after a short delay
      setTimeout(() => {
        setLocation('/');
      }, 3000);

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId) {
      toast({
        title: "Resend error",
        description: "Unable to find your account information. Please login again.",
        variant: "destructive",
      });
      return;
    }

    setResendLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Resend failed",
          description: data.message || "Failed to resend verification code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      });

    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: "Resend failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (verificationSuccess) {
    return (
      <PageLayout
        title="Account Verified"
        subtitle="Your account has been successfully verified"
        bgColor="linear-gradient(135deg, #f0f4f9 0%, #e6f0fb 100%)"
      >
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-blue-50">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Account Verified!</h2>
            <p className="text-gray-500">You have successfully verified your account.</p>
          </div>

          <div className="bg-green-50 border border-green-100 p-4 rounded-md mb-6">
            <p className="text-green-800 text-center">
              You're being redirected to the home page...
            </p>
          </div>

          <Button 
            onClick={() => setLocation('/')}
            className="w-full bg-[#0033a0] hover:bg-[#002680] text-white py-2.5 font-medium rounded-md transition-all duration-200 shadow-sm"
          >
            Go to Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Verify Your Account"
      subtitle="Enter the verification code sent to your email"
      bgColor="linear-gradient(135deg, #f0f4f9 0%, #e6f0fb 100%)"
    >
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-blue-50">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <LockIcon className="h-8 w-8 text-[#0033a0]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Verify Your Account</h2>
          <p className="text-gray-500">Please enter the 6-digit code sent to your email</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="verificationCode" className="text-gray-700 font-medium">Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => {
                // Only allow digits and limit to 6 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              className="w-full text-center tracking-widest text-lg font-bold bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0033a0]"
              placeholder="123456"
              maxLength={6}
              required
              disabled={isLoading || verificationSuccess}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#0033a0] hover:bg-[#002680] text-white py-2.5 font-medium rounded-md transition-all duration-200 shadow-sm"
            disabled={isLoading || verificationSuccess || verificationCode.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 mb-4">Didn't receive the code?</p>
          <Button 
            variant="outline" 
            onClick={handleResendCode}
            disabled={resendLoading || isLoading || verificationSuccess}
            className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            {resendLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Need help?{" "}
            <a href="mailto:support@nedaxer.com" className="text-[#0033a0] hover:text-[#ff5900] font-semibold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}