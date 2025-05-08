import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function VerifyAccount() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for verification code
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Process query parameters on component mount
  useEffect(() => {
    // Redirect if user is already logged in and verified
    if (user?.isVerified) {
      toast({
        title: "Already verified",
        description: "Your account is already verified. Redirecting to home page...",
      });
      setTimeout(() => setLocation("/"), 2000);
      return;
    }
    
    // Extract userId from URL parameters
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const userIdParam = searchParams.get('userId');
    const codeParam = searchParams.get('code');
    
    if (userIdParam) {
      setUserId(parseInt(userIdParam, 10));
    } else {
      // Try to get userId from localStorage as fallback
      const storedUserId = localStorage.getItem('unverifiedUserId');
      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
      }
    }
    
    // If code is in URL, set it
    if (codeParam) {
      setVerificationCode(codeParam);
      // Optionally auto-submit
      // handleVerify(); // Would need to make handleVerify not need the event parameter
    }
    
    // For development: check if we have a verification code stored
    if (process.env.NODE_ENV === 'development') {
      const devCode = localStorage.getItem('devVerificationCode');
      if (devCode && !codeParam) {
        setVerificationCode(devCode);
      }
    }
  }, [location, user, toast, setLocation]);
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Missing user ID",
        description: "Cannot verify without user ID. Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }
    
    if (!verificationCode || verificationCode.length !== 4) {
      toast({
        title: "Invalid code",
        description: "Please enter the 4-digit verification code sent to your email.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setVerificationStatus('idle');
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/auth/verify", {
        userId,
        code: verificationCode
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || "Verification failed. Please try again.");
        setVerificationStatus('error');
        toast({
          title: "Verification failed",
          description: data.message || "Please check your code and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Verification successful
      setVerificationStatus('success');
      localStorage.removeItem('unverifiedUserId');
      localStorage.removeItem('devVerificationCode');
      
      toast({
        title: "Verification successful",
        description: "Your account has been verified. You can now log in.",
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        setLocation('/account/login');
      }, 2000);
      
    } catch (error) {
      console.error('Verification error:', error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setVerificationStatus('error');
      
      toast({
        title: "Verification error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!userId) {
      toast({
        title: "Missing user ID",
        description: "Cannot resend verification without user ID. Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/resend-verification", {
        userId
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Failed to resend",
          description: data.message || "Please try again later or contact support.",
          variant: "destructive",
        });
        return;
      }
      
      // Store verification code for development mode if available
      if (process.env.NODE_ENV === 'development' && data.verificationCode) {
        localStorage.setItem('devVerificationCode', data.verificationCode);
        setVerificationCode(data.verificationCode);
      }
      
      toast({
        title: "Verification code resent",
        description: "Please check your email for the new verification code.",
      });
      
    } catch (error) {
      console.error('Resend verification error:', error);
      
      toast({
        title: "Resend error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-blue-50">
          <div className="text-center mb-8">
            {verificationStatus === 'success' ? (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            ) : verificationStatus === 'error' ? (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <svg className="h-8 w-8 text-[#0033a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {verificationStatus === 'success' 
                ? "Account Verified!" 
                : verificationStatus === 'error' 
                  ? "Verification Failed" 
                  : "Verify Your Account"}
            </h2>
            <p className="text-gray-500">
              {verificationStatus === 'success' 
                ? "Your account has been successfully verified. You can now log in." 
                : verificationStatus === 'error' 
                  ? error || "Please check your code and try again." 
                  : "Enter the 4-digit code sent to your email address"}
            </p>
          </div>

          {verificationStatus !== 'success' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-gray-700 font-medium">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                  placeholder="Enter 4-digit code"
                  pattern="[0-9]{4}"
                  className="text-center text-lg tracking-wider font-medium bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0033a0]"
                  maxLength={4}
                  required
                  disabled={isLoading || verificationStatus === 'success'}
                />
              </div>

              {process.env.NODE_ENV === 'development' && verificationCode && (
                <div className="p-2 bg-gray-100 rounded text-center text-sm text-gray-500">
                  Development mode: Using code {verificationCode}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#0033a0] hover:bg-[#002680] text-white py-2.5 font-medium rounded-md transition-all duration-200 shadow-sm"
                disabled={isLoading || verificationStatus === 'success'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  className="text-[#0033a0] hover:text-[#ff5900] text-sm font-medium"
                  onClick={handleResendVerification}
                  disabled={isLoading || verificationStatus === 'success'}
                >
                  Didn't receive a code? Resend verification code
                </button>
              </div>
            </form>
          )}

          {verificationStatus === 'success' && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-md text-green-800 text-center">
                Your account has been successfully verified. You will be redirected to login.
              </div>
              <Button 
                onClick={() => setLocation('/account/login')}
                className="w-full bg-[#0033a0] hover:bg-[#002680] text-white py-2.5 font-medium rounded-md transition-all duration-200 shadow-sm"
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            <Link href="/account/login" className="text-[#0033a0] hover:text-[#ff5900] font-medium">
              Back to Login
            </Link>
            {" "}or{" "}
            <Link href="/" className="text-[#0033a0] hover:text-[#ff5900] font-medium">
              Return to Home
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}