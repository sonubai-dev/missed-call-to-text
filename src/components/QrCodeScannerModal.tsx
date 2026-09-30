import React, { useState } from "react";
import { X, QrCode, Smartphone, Check, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (phoneNumber: string) => void;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleLink = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onConnect(phoneNumber);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-md bg-[#111B21] border border-[#222E35] rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#222E35]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#00A884]" />
            <h2 className="text-base font-bold text-white">Link WhatsApp Web Session</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202C33] text-[#8696A0] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Visual Simulation */}
        <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl shadow-inner text-slate-900">
          <div className="w-44 h-44 border-4 border-slate-900 p-2 flex flex-col justify-between rounded-lg relative overflow-hidden bg-slate-50">
            {/* Custom SVG matrix simulating real WhatsApp QR code */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950 fill-current">
              <rect x="0" y="0" width="28" height="28" />
              <rect x="4" y="4" width="20" height="20" fill="white" />
              <rect x="8" y="8" width="12" height="12" />

              <rect x="72" y="0" width="28" height="28" />
              <rect x="76" y="4" width="20" height="20" fill="white" />
              <rect x="80" y="8" width="12" height="12" />

              <rect x="0" y="72" width="28" height="28" />
              <rect x="4" y="76" width="20" height="20" fill="white" />
              <rect x="8" y="80" width="12" height="12" />

              {/* Data dots */}
              <circle cx="50" cy="50" r="5" />
              <rect x="36" y="10" width="8" height="8" />
              <rect x="52" y="10" width="8" height="8" />
              <rect x="36" y="30" width="8" height="12" />
              <rect x="52" y="26" width="12" height="6" />
              <rect x="70" y="40" width="10" height="10" />
              <rect x="20" y="45" width="8" height="8" />
              <rect x="42" y="65" width="16" height="8" />
              <rect x="68" y="70" width="12" height="12" />
              <rect x="85" y="55" width="8" height="8" />
            </svg>

            {isScanning && (
              <div className="absolute inset-0 bg-[#00A884]/20 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#00A884] animate-spin" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-600 font-semibold mt-3">
            Scan with WhatsApp on your phone
          </p>
        </div>

        {/* Instructions */}
        <ol className="text-xs text-[#8696A0] space-y-1 list-decimal pl-4">
          <li>Open WhatsApp on your Android business phone</li>
          <li>Tap Menu or Settings and select <b>Linked Devices</b></li>
          <li>Tap <b>Link a device</b> and point your phone at this screen</li>
        </ol>

        {/* Phone number input */}
        <div>
          <label className="block text-xs font-semibold text-[#8696A0] mb-1">
            Or Link Directly by Phone Number
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
          />
        </div>

        <button
          onClick={handleLink}
          disabled={isScanning}
          className="w-full py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20 flex items-center justify-center gap-2"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Linking Session...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Simulate Pairing & Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
