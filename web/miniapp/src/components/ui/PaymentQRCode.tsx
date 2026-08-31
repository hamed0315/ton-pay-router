
import { QRCodeSVG } from 'qrcode.react';
import Logo from '@/components/ui/Logo';

interface PaymentQRCodeProps {
  value: string;
  size?: number;
}

export default function PaymentQRCode({ value, size = 200 }: PaymentQRCodeProps) {
  return (
    <div className="relative inline-flex items-center justify-center bg-white rounded-2xl p-3">
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#0B0B14"
        level="H"
        imageSettings={{
          src: '/logo.svg',
          width: 40,
          height: 40,
          excavate: true,
        }}
      />
      {/* لوگوی مثلث به صورت SVG داخلی (به جای تصویر خارجی) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg p-1">
          <Logo size="sm" />
        </div>
      </div>
    </div>
  );
}
