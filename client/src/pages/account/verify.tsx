import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircleIcon, LockIcon, Loader2Icon, RefreshCwIcon, InfoIcon } from "lucide-react";

export default function VerifyAccount() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  // On component mount, check URL for userId parameter and get development verification code if available
  useEffect(() => {
    const extractUserIdFromUrl = () => {
      // First try to extract from hash part of URL (/#/account/verify?userId=X)
      const hashString = window.location.hash;
      if (hashString) {
        // Get the part after the ? if it exists
        const queryPart = hashString.split('?')[1];
        if (queryPart) {
          const params = new URLSearchParams(queryPart);
          const userIdParam = params.get('userId');
          if (userIdParam) {
            console.log("Found userId in hash:", userIdParam);
            return parseInt(userIdParam, 10);
          }
        }
      }

      // If not in hash, try regular query params (/account/verify?userId=X)
      const params = new URLSearchParams(window.location.search);
      const userIdParam = params.get('userId');
      if (userIdParam) {
        console.log("Found userId in search params:", userIdParam);
        return parseInt(userIdParam, 10);
      }
      
      return null;
    };

    // Attempt to get the userId from multiple possible sources
    const urlUserId = extractUserIdFromUrl();
    const storedUserId = localStorage.getItem('unverifiedUserId');
    
    if (urlUserId) {
      // Always prefer URL parameter if available
      setUserId(urlUserId);
      // Also save to localStorage for persistence
      localStorage.setItem('unverifiedUserId', urlUserId.toString());
    } else if (storedUserId) {
      console.log("Found userId in localStorage:", storedUserId);
      setUserId(parseInt(storedUserId, 10));
    } else {
      // Display clear message and redirect if no userId found
      console.log("No userId found in URL or localStorage");
      toast({
        title: "Verification information missing",
        description: "We couldn't find your account information. Please try registering again.",
        variant: "destructive",
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        setLocation('/account/login');
      }, 2000);
      return;
    }
    
    // Check for development verification code in localStorage (added during registration)
    const devVerificationCode = localStorage.getItem('devVerificationCode');
    if (devVerificationCode) {
      console.log("Development mode: Found verification code:", devVerificationCode);
      setDevCode(devVerificationCode);
      
      // Show a toast to make it obvious to the user
      toast({
        title: "Development Mode",
        description: "A verification code is available for testing",
      });
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

      // Check if server returned a verification code (development mode)
      if (data.verificationCode) {
        setDevCode(data.verificationCode);
        toast({
          title: "Development Mode",
          description: "New verification code is now displayed on screen.",
        });
      } else {
        toast({
          title: "Code resent",
          description: "A new verification code has been sent to your email.",
        });
      }

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
        
        {/* Display the verification code in development mode */}
        {devCode && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <InfoIcon className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-semibold">Development Mode</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="text-amber-700">
                <p className="mb-2">Since email services are not configured, your verification code is shown here:</p>
                <div className="bg-white border-2 border-dashed border-amber-300 rounded-md p-3 font-mono text-center text-xl font-bold tracking-widest text-amber-600">
                  {devCode}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setVerificationCode(devCode || "")}
                    className="text-sm py-1 px-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md transition-colors duration-200"
                  >
                    Auto-fill code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationCode(devCode || "");
                      if (userId && devCode) {
                        handleVerify({ preventDefault: () => {} } as React.FormEvent);
                      }
                    }}
                    className="text-sm py-1 px-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors duration-200"
                  >
                    Auto-verify
                  </button>
                </div>
                <p className="mt-3 text-xs text-amber-600">
                  In production, this code would be sent to your email address.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

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