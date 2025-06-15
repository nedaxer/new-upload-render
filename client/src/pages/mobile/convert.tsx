import { MobileLayout } from '@/components/mobile-layout';
import CryptoConverter from '@/components/crypto-converter';

export default function MobileConvert() {
  return (
    <MobileLayout>
      <div className="px-4 py-4">
        <CryptoConverter />
      </div>
    </MobileLayout>
  );
}