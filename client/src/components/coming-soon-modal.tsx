import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Clock } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export function ComingSoonModal({ isOpen, onClose, feature }: ComingSoonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-sm mx-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          
          <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
          <p className="text-gray-400 mb-6">
            {feature} will be available soon. We're working hard to bring you this feature.
          </p>
          
          <Button 
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}