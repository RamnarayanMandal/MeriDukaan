"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { SwitchCamera, X } from "lucide-react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");
    startScanner(facingMode);

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.error("Failed to stop scanner", e));
      }
    };
  }, []);

  const [isSuccess, setIsSuccess] = useState(false);

  const toggleCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    startScanner(newMode);
  };

  const handleDetected = (text: string) => {
    console.log("Scanner Detected:", text);
    
    // Immediate beep feedback
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 500);
    onScan(text);
  };

  const startScanner = (mode: "environment" | "user") => {
    if (!scannerRef.current) return;

    const start = () => {
      scannerRef.current?.start(
        { facingMode: mode },
        { 
          fps: 20,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Responsive box: 70% of width, but not too small
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const boxSize = Math.floor(minEdge * 0.7);
            return { width: boxSize, height: Math.floor(boxSize * 0.6) }; // Slightly horizontal for 1D barcodes
          },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        handleDetected,
        () => {}
      ).catch((err) => {
        console.error("Camera start error:", err);
        setError(`Camera Error: ${err.message || "Permission Denied"}`);
      });
    };

    if (scannerRef.current.isScanning) {
      scannerRef.current.stop().then(start).catch(console.error);
    } else {
      start();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Scan QR/Barcode</h2>
        
        <div className={`overflow-hidden rounded-xl bg-black flex items-center justify-center min-h-[300px] transition-all duration-300 ${isSuccess ? 'ring-8 ring-green-500' : ''}`}>
          <div id="qr-reader" className="w-full h-full"></div>
        </div>

        {error && <p className="text-red-500 text-sm text-center mt-4 font-medium">{error}</p>}

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={toggleCamera} 
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
          >
            <SwitchCamera className="h-5 w-5" />
            <span>Switch Camera</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
