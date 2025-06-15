import React, { useState, useRef, useCallback } from 'react';
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Shield,
  Camera,
  CheckCircle,
  AlertCircle,
  Upload,
  RotateCcw,
  X,
  Eye,
  User,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface KYCData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
  };
  documents: {
    idFront: string | null;
    idBack: string | null;
    selfie: string | null;
  };
  verification: {
    status: 'pending' | 'processing' | 'verified' | 'rejected';
    confidence: number;
    issues: string[];
  };
}

export default function MobileKYC() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch KYC status
  const { data: kycStatus } = useQuery({
    queryKey: ['kyc', 'status'],
    queryFn: () => apiRequest('/api/users/kyc/status'),
  });

  // KYC submission mutation
  const submitKycMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/users/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }),
    onSuccess: (data) => {
      toast({
        title: "KYC Submitted Successfully",
        description: `Your documents have been submitted. Processing time: ${data.data.estimatedProcessingTime}`,
      });
      setKycData(prev => ({
        ...prev,
        verification: {
          ...prev.verification,
          status: 'processing'
        }
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit KYC documents",
        variant: "destructive"
      });
    }
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [captureType, setCaptureType] = useState<'id-front' | 'id-back' | 'selfie' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [kycData, setKycData] = useState<KYCData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      address: ''
    },
    documents: {
      idFront: null,
      idBack: null,
      selfie: null
    },
    verification: {
      status: 'pending',
      confidence: 0,
      issues: []
    }
  });

  const startCamera = useCallback(async (type: 'id-front' | 'id-back' | 'selfie') => {
    setCaptureType(type);
    setShowCamera(true);
    
    try {
      const constraints = {
        video: {
          facingMode: type === 'selfie' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to capture documents",
        variant: "destructive"
      });
      setShowCamera(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCaptureType(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !captureType) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Update documents state
    setKycData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [captureType.replace('-', '')]: imageData
      }
    }));
    
    // Simulate real-time verification
    simulateDocumentVerification(captureType, imageData);
    
    stopCamera();
    
    toast({
      title: "Photo Captured",
      description: `${captureType.replace('-', ' ').toUpperCase()} captured successfully`,
    });
  }, [captureType, stopCamera, toast]);

  const simulateDocumentVerification = async (type: string, imageData: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate verification results
    const verificationResults = {
      'id-front': {
        confidence: Math.random() * 20 + 80, // 80-100%
        issues: Math.random() > 0.8 ? ['Low image quality'] : []
      },
      'id-back': {
        confidence: Math.random() * 15 + 85, // 85-100%
        issues: Math.random() > 0.9 ? ['Glare detected'] : []
      },
      'selfie': {
        confidence: Math.random() * 10 + 90, // 90-100%
        issues: Math.random() > 0.95 ? ['Face not clearly visible'] : []
      }
    };
    
    const result = verificationResults[type as keyof typeof verificationResults];
    
    setKycData(prev => ({
      ...prev,
      verification: {
        ...prev.verification,
        confidence: Math.max(prev.verification.confidence, result.confidence),
        issues: [...prev.verification.issues, ...result.issues]
      }
    }));
    
    setIsProcessing(false);
    
    if (result.confidence > 85 && result.issues.length === 0) {
      toast({
        title: "Verification Successful",
        description: `${type.replace('-', ' ').toUpperCase()} verified with ${result.confidence.toFixed(1)}% confidence`,
      });
    } else if (result.issues.length > 0) {
      toast({
        title: "Verification Warning",
        description: result.issues.join(', '),
        variant: "destructive"
      });
    }
  };

  const handleSubmitKYC = async () => {
    const { documents, personalInfo } = kycData;
    
    if (!documents.idFront || !documents.idBack || !documents.selfie) {
      toast({
        title: "Incomplete Documents",
        description: "Please capture all required documents",
        variant: "destructive"
      });
      return;
    }
    
    const submissionData = {
      documents,
      personalInfo: {
        firstName: personalInfo.firstName || user?.firstName || '',
        lastName: personalInfo.lastName || user?.lastName || '',
        dateOfBirth: personalInfo.dateOfBirth,
        nationality: personalInfo.nationality,
        address: personalInfo.address
      }
    };
    
    submitKycMutation.mutate(submissionData);
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  const getDocumentStatus = (docType: keyof typeof kycData.documents) => {
    if (kycData.documents[docType]) {
      if (kycData.verification.issues.length === 0) {
        return 'verified';
      } else {
        return 'warning';
      }
    }
    return 'pending';
  };

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="flex flex-col h-full">
          {/* Camera Header */}
          <div className="flex items-center justify-between p-4">
            <Button
              onClick={stopCamera}
              variant="ghost"
              size="sm"
              className="text-white"
            >
              <X className="w-6 h-6" />
            </Button>
            <h2 className="text-white text-lg font-semibold">
              {captureType === 'selfie' ? 'Take Selfie' : 
               captureType === 'id-front' ? 'ID Front Side' : 
               'ID Back Side'}
            </h2>
            <div className="w-6 h-6" />
          </div>

          {/* Camera View */}
          <div className="flex-1 relative overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Overlay Guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-orange-500 border-dashed rounded-lg bg-black bg-opacity-30">
                {captureType === 'selfie' ? (
                  <div className="w-64 h-80 flex items-center justify-center">
                    <User className="w-16 h-16 text-orange-500" />
                  </div>
                ) : (
                  <div className="w-80 h-52 flex items-center justify-center">
                    <CreditCard className="w-16 h-16 text-orange-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-32 left-0 right-0 px-4 z-10">
              <div className="bg-black bg-opacity-70 rounded-lg p-4">
                <p className="text-white text-center text-sm">
                  {captureType === 'selfie' 
                    ? 'Position your face within the frame and ensure good lighting'
                    : `Position your ${captureType?.includes('front') ? 'ID front' : 'ID back'} within the frame`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6 flex items-center justify-center space-x-8">
            <Button
              onClick={stopCamera}
              variant="ghost"
              className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              <X className="w-6 h-6" />
            </Button>
            <Button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-orange-500 hover:bg-orange-600 border-4 border-white"
            >
              <Camera className="w-10 h-10" />
            </Button>
            <div className="w-12 h-12" /> {/* Spacer for centering */}
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <Link href="/mobile/profile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-white text-lg font-semibold">Identity Verification</h1>
        <div className="w-6 h-6" />
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm">Verification Progress</span>
          <span className="text-orange-500 text-sm">
            {Math.round(kycData.verification.confidence)}% Complete
          </span>
        </div>
        <Progress 
          value={kycData.verification.confidence} 
          className="w-full h-2 bg-gray-700"
        />
      </div>

      <div className="px-4 space-y-6">
        {/* Status Card */}
        {kycData.verification.status !== 'pending' && (
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              {kycData.verification.status === 'verified' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : kycData.verification.status === 'rejected' ? (
                <AlertCircle className="w-6 h-6 text-red-500" />
              ) : (
                <Shield className="w-6 h-6 text-orange-500" />
              )}
              <div>
                <h3 className="text-white font-semibold">
                  {kycData.verification.status === 'verified' ? 'Verification Complete' :
                   kycData.verification.status === 'rejected' ? 'Verification Failed' :
                   'Processing Verification'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {kycData.verification.status === 'verified' ? 'Your identity has been successfully verified' :
                   kycData.verification.status === 'rejected' ? 'Please retake your documents' :
                   'Your documents are being processed'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Document Verification */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-orange-500" />
            <h2 className="text-white text-lg font-semibold">Document Verification</h2>
          </div>

          <div className="space-y-4">
            {/* ID Front */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">ID Front Side</h3>
                  <p className="text-gray-400 text-sm">Clear photo of ID front</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getDocumentStatus('idFront') === 'verified' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {getDocumentStatus('idFront') === 'warning' && (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </div>
              
              {kycData.documents.idFront ? (
                <div className="relative">
                  <img 
                    src={kycData.documents.idFront} 
                    alt="ID Front" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => startCamera('id-front')}
                    className="absolute top-2 right-2 p-2 bg-black bg-opacity-50"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => startCamera('id-front')}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isProcessing}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture ID Front
                </Button>
              )}
            </div>

            {/* ID Back */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">ID Back Side</h3>
                  <p className="text-gray-400 text-sm">Clear photo of ID back</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getDocumentStatus('idBack') === 'verified' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {getDocumentStatus('idBack') === 'warning' && (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </div>
              
              {kycData.documents.idBack ? (
                <div className="relative">
                  <img 
                    src={kycData.documents.idBack} 
                    alt="ID Back" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => startCamera('id-back')}
                    className="absolute top-2 right-2 p-2 bg-black bg-opacity-50"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => startCamera('id-back')}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isProcessing}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture ID Back
                </Button>
              )}
            </div>

            {/* Selfie */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">Selfie Verification</h3>
                  <p className="text-gray-400 text-sm">Clear selfie for face matching</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getDocumentStatus('selfie') === 'verified' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {getDocumentStatus('selfie') === 'warning' && (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </div>
              
              {kycData.documents.selfie ? (
                <div className="relative">
                  <img 
                    src={kycData.documents.selfie} 
                    alt="Selfie" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => startCamera('selfie')}
                    className="absolute top-2 right-2 p-2 bg-black bg-opacity-50"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => startCamera('selfie')}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isProcessing}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Selfie
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Verification Issues */}
        {kycData.verification.issues.length > 0 && (
          <Card className="bg-red-900 bg-opacity-20 border-red-500 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-white font-semibold">Verification Issues</h3>
            </div>
            <ul className="space-y-1">
              {kycData.verification.issues.map((issue, index) => (
                <li key={index} className="text-red-300 text-sm">• {issue}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Submit Button */}
        {kycData.documents.idFront && kycData.documents.idBack && kycData.documents.selfie && 
         kycData.verification.status === 'pending' && (
          <Button
            onClick={handleSubmitKYC}
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={submitKycMutation.isPending}
          >
            {submitKycMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
          </Button>
        )}

        {/* Processing Status */}
        {kycData.verification.status === 'processing' && (
          <Card className="bg-yellow-900 bg-opacity-20 border-yellow-500 p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="text-white font-semibold">Processing Your Documents</h3>
                <p className="text-yellow-300 text-sm">
                  Your KYC documents are being reviewed. This typically takes 24-48 hours.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white font-semibold mb-3">Verification Tips</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Ensure good lighting when taking photos</li>
            <li>• Keep documents flat and within the frame</li>
            <li>• Avoid glare and shadows</li>
            <li>• Make sure all text is clearly readable</li>
            <li>• Your face should be clearly visible in the selfie</li>
          </ul>
        </Card>
      </div>
    </MobileLayout>
  );
}