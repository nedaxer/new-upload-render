import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  User,
  CreditCard,
  Shield,
  Clock,
  Scan,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function MobileKYC() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState('document-upload');
  const [documents, setDocuments] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
    proofOfAddress: null as File | null
  });
  const [verificationResults, setVerificationResults] = useState({
    idFront: { verified: false, confidence: 0, details: '' },
    idBack: { verified: false, confidence: 0, details: '' },
    selfie: { verified: false, confidence: 0, details: '' },
    faceMatch: { verified: false, confidence: 0, details: '' }
  });
  const [personalData, setPersonalData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    documentNumber: '',
    nationality: ''
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureType, setCaptureType] = useState<'front' | 'back' | 'selfie'>('front');

  const verificationLevels = [
    {
      level: 1,
      title: "Basic Verification",
      status: "completed",
      description: "Email and phone verification",
      dailyLimit: "$2,000",
      features: ["Basic trading", "Deposit crypto", "Withdraw up to $2,000/day"],
      requirements: ["Email verification", "Phone verification"]
    },
    {
      level: 2,
      title: "Intermediate Verification",
      status: "in-progress",
      description: "Government ID verification",
      dailyLimit: "$50,000",
      features: ["Advanced trading", "Higher limits", "Fiat deposits"],
      requirements: ["Government-issued ID", "Address verification"]
    },
    {
      level: 3,
      title: "Advanced Verification",
      status: "pending",
      description: "Enhanced due diligence",
      dailyLimit: "Unlimited",
      features: ["Maximum limits", "VIP support", "Advanced features"],
      requirements: ["Enhanced documentation", "Source of funds", "Video verification"]
    }
  ];

  // Simulate AI-powered ID verification
  const verifyDocument = async (file: File, type: string): Promise<{verified: boolean, confidence: number, details: string}> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate real AI verification with random but realistic results
        const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
        const verified = confidence > 0.75;
        
        let details = '';
        if (type === 'idFront') {
          details = verified ? 'Valid government ID detected. Name and photo clearly visible.' : 'ID quality too low or document not recognized.';
        } else if (type === 'idBack') {
          details = verified ? 'Barcode/MRZ readable. Address and security features detected.' : 'Back of ID unclear or security features not detected.';
        } else if (type === 'selfie') {
          details = verified ? 'Clear face detected. Good lighting and image quality.' : 'Face not clearly visible or image quality insufficient.';
        }
        
        resolve({ verified, confidence: Math.round(confidence * 100) / 100, details });
      }, 2000 + Math.random() * 3000); // 2-5 second delay
    });
  };

  const extractPersonalData = (file: File): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate OCR extraction
        resolve({
          fullName: 'John Smith',
          dateOfBirth: '1990-05-15',
          documentNumber: 'ID123456789',
          nationality: 'United States'
        });
      }, 1500);
    });
  };

  const performFaceMatch = async (): Promise<{verified: boolean, confidence: number, details: string}> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const confidence = Math.random() * 0.2 + 0.8; // 80-100% for face match
        const verified = confidence > 0.85;
        const details = verified ? 'Face matches ID photo with high confidence.' : 'Face match confidence below threshold.';
        
        resolve({ verified, confidence: Math.round(confidence * 100) / 100, details });
      }, 3000);
    });
  };

  const handleFileUpload = async (type: keyof typeof documents, file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
    
    // Start verification immediately
    setIsVerifying(true);
    
    if (type === 'idFront') {
      const result = await verifyDocument(file, 'idFront');
      setVerificationResults(prev => ({ ...prev, idFront: result }));
      
      if (result.verified) {
        const personalInfo = await extractPersonalData(file);
        setPersonalData(prev => ({ ...prev, ...personalInfo }));
        toast({
          title: "ID Front Verified",
          description: "Document successfully verified and data extracted",
        });
      }
    } else if (type === 'idBack') {
      const result = await verifyDocument(file, 'idBack');
      setVerificationResults(prev => ({ ...prev, idBack: result }));
      
      if (result.verified) {
        toast({
          title: "ID Back Verified",
          description: "Security features confirmed",
        });
      }
    } else if (type === 'selfie') {
      const result = await verifyDocument(file, 'selfie');
      setVerificationResults(prev => ({ ...prev, selfie: result }));
      
      if (result.verified && documents.idFront) {
        const faceMatchResult = await performFaceMatch();
        setVerificationResults(prev => ({ ...prev, faceMatch: faceMatchResult }));
        
        if (faceMatchResult.verified) {
          toast({
            title: "Face Match Successful",
            description: "Your selfie matches your ID photo",
          });
        }
      }
    }
    
    setIsVerifying(false);
  };

  const startCamera = async (type: 'front' | 'back' | 'selfie') => {
    setCaptureType(type);
    setIsCapturing(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: type === 'selfie' ? 'user' : 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${captureType}.jpg`, { type: 'image/jpeg' });
          handleFileUpload(captureType === 'front' ? 'idFront' : captureType === 'back' ? 'idBack' : 'selfie', file);
        }
      }, 'image/jpeg', 0.8);
      
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Verified</Badge>;
      case 'in-progress':
        return <Badge className="bg-orange-500 text-white">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <Link href="/mobile/profile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-white text-lg font-semibold">Identity Verification</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Status */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white text-lg font-semibold">Current Status</h2>
            <Badge className="bg-green-500 text-white">Lv.1 Verified</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-white font-medium">Basic Verification Complete</p>
              <p className="text-gray-400 text-sm">Daily withdrawal limit: $2,000</p>
            </div>
          </div>
        </Card>

        {/* Verification Levels */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">Verification Levels</h3>
          
          {verificationLevels.map((level) => (
            <Card key={level.level} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(level.status)}
                  <div>
                    <h4 className="text-white font-medium">Level {level.level}: {level.title}</h4>
                    <p className="text-gray-400 text-sm">{level.description}</p>
                  </div>
                </div>
                {getStatusBadge(level.status)}
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Daily Limit:</span>
                  <span className="text-white text-sm font-medium">{level.dailyLimit}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-400 text-sm font-medium">Features:</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  {level.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {level.status !== 'completed' && (
                <Button 
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setSelectedLevel(level.level)}
                >
                  {level.status === 'in-progress' ? 'Continue Verification' : 'Start Verification'}
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Level 2 Verification Form */}
        {selectedLevel === 2 && (
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Level 2 Verification</h3>
            
            <div className="space-y-4">
              {/* Personal Information */}
              <div>
                <Label className="text-gray-300">Full Name</Label>
                <Input 
                  className="bg-gray-700 border-gray-600 text-white"
                  value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  disabled
                />
              </div>

              <div>
                <Label className="text-gray-300">Date of Birth</Label>
                <Input 
                  type="date"
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Select your date of birth"
                />
              </div>

              <div>
                <Label className="text-gray-300">Address</Label>
                <Input 
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter your full address"
                />
              </div>

              {/* ID Front Upload */}
              <div className="space-y-3">
                <Label className="text-gray-300 flex items-center">
                  ID Front (with photo)
                  {verificationResults.idFront.verified && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                </Label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  documents.idFront ? 'border-green-500 bg-green-500/10' : 'border-gray-600'
                }`}>
                  {documents.idFront ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-green-400 text-sm">ID Front Captured</p>
                      {verificationResults.idFront.verified && (
                        <div className="text-xs text-gray-300">
                          <p>Confidence: {(verificationResults.idFront.confidence * 100).toFixed(1)}%</p>
                          <p>{verificationResults.idFront.details}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm mb-2">Capture front of your ID</p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => startCamera('front')}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Camera
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => document.getElementById('id-front-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      <input 
                        id="id-front-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('idFront', e.target.files[0])}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* ID Back Upload */}
              <div className="space-y-3">
                <Label className="text-gray-300 flex items-center">
                  ID Back (with barcode/info)
                  {verificationResults.idBack.verified && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                </Label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  documents.idBack ? 'border-green-500 bg-green-500/10' : 'border-gray-600'
                }`}>
                  {documents.idBack ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-green-400 text-sm">ID Back Captured</p>
                      {verificationResults.idBack.verified && (
                        <div className="text-xs text-gray-300">
                          <p>Confidence: {(verificationResults.idBack.confidence * 100).toFixed(1)}%</p>
                          <p>{verificationResults.idBack.details}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm mb-2">Capture back of your ID</p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => startCamera('back')}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Camera
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => document.getElementById('id-back-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      <input 
                        id="id-back-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('idBack', e.target.files[0])}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Selfie Upload */}
              <div className="space-y-3">
                <Label className="text-gray-300 flex items-center">
                  Selfie
                  {verificationResults.selfie.verified && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                  {verificationResults.faceMatch.verified && <CheckCircle className="w-4 h-4 text-blue-500 ml-1" />}
                </Label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  documents.selfie ? 'border-green-500 bg-green-500/10' : 'border-gray-600'
                }`}>
                  {documents.selfie ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-green-400 text-sm">Selfie Captured</p>
                      {verificationResults.selfie.verified && (
                        <div className="text-xs text-gray-300">
                          <p>Confidence: {(verificationResults.selfie.confidence * 100).toFixed(1)}%</p>
                          <p>{verificationResults.selfie.details}</p>
                          {verificationResults.faceMatch.verified && (
                            <p className="text-blue-400">Face Match: {(verificationResults.faceMatch.confidence * 100).toFixed(1)}%</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm mb-2">Take a clear selfie</p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => startCamera('selfie')}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Camera
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => document.getElementById('selfie-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      <input 
                        id="selfie-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                      />
                    </>
                  )}
                </div>
              </div>

              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-6"
                disabled={!verificationResults.idFront.verified || !verificationResults.idBack.verified || !verificationResults.selfie.verified}
              >
                Submit for Verification
              </Button>
            </div>
          </Card>
        )}

        {/* Camera Capture Modal */}
        {isCapturing && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between p-4">
                <Button 
                  variant="ghost" 
                  onClick={stopCamera}
                  className="text-white"
                >
                  <X className="w-6 h-6" />
                </Button>
                <h2 className="text-white text-lg font-semibold">
                  Capture {captureType === 'front' ? 'ID Front' : captureType === 'back' ? 'ID Back' : 'Selfie'}
                </h2>
                <div className="w-10"></div>
              </div>
              
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline
                    className="w-full max-w-sm rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Overlay guides */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white border-dashed rounded-lg w-3/4 h-3/4 flex items-center justify-center">
                      <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                        {captureType === 'selfie' ? 'Position your face' : 'Position your ID'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex justify-center">
                <Button 
                  onClick={capturePhoto}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-16 h-16 rounded-full"
                >
                  <Camera className="w-8 h-8" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Progress */}
        {isVerifying && (
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
              <div>
                <h3 className="text-white font-medium">Verifying Document...</h3>
                <p className="text-gray-400 text-sm">AI is analyzing your document for authenticity</p>
              </div>
            </div>
          </Card>
        )}

        {/* Important Notes */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white text-lg font-semibold mb-3">Important Notes</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Verification typically takes 1-3 business days</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>All documents must be clear and legible</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Personal information must match your ID exactly</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Higher verification levels unlock increased limits</span>
            </li>
          </ul>
        </Card>
      </div>
    </MobileLayout>
  );
}