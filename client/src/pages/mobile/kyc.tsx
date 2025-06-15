import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  User,
  CreditCard,
  Shield,
  Clock
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function MobileKYC() {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
    selfie: null as File | null
  });

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

  const handleFileUpload = (type: keyof typeof documents, file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
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

              {/* Document Upload */}
              <div className="space-y-3">
                <Label className="text-gray-300">Government ID</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                  <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-2">Upload your government-issued ID</p>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => document.getElementById('id-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <input 
                    id="id-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('idDocument', e.target.files[0])}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300">Proof of Address</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                  <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-2">Upload utility bill or bank statement</p>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => document.getElementById('address-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <input 
                    id="address-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('proofOfAddress', e.target.files[0])}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300">Selfie with ID</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-2">Take a selfie holding your ID</p>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => document.getElementById('selfie-upload')?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                  <input 
                    id="selfie-upload" 
                    type="file" 
                    accept="image/*" 
                    capture="user"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                  />
                </div>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-6">
                Submit for Verification
              </Button>
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