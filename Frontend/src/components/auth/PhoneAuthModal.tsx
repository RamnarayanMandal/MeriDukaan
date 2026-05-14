"use client";

import { useState, useEffect } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { showError, showSuccess } from "@/lib/sweetAlert";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function PhoneAuthModal({ isOpen, onClose, onSuccess }: PhoneAuthModalProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !window.recaptchaVerifier) {
      setTimeout(() => {
        const container = document.getElementById("recaptcha-container");
        if (container && auth) {
          try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
              size: "invisible",
            });
          } catch (error) {
            console.error("Recaptcha Init Error:", error);
          }
        }
      }, 100);
    }
  }, [isOpen]);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      showError("Please enter a valid 10-digit mobile number");
      return;
    }
    
    setIsLoading(true);
    try {
      const formattedPhone = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      showSuccess("OTP Sent Successfully!");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Failed to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      showError("Please enter a valid OTP");
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      showSuccess("Login Successful!");
      onSuccess(result.user);
      onClose();
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Invalid OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step === "phone" ? "Login with Phone" : "Verify OTP"}</DialogTitle>
          <DialogDescription>
            {step === "phone" 
              ? "Enter your mobile number to receive an OTP and manage your bookings." 
              : `Enter the 6-digit OTP sent to +91 ${phone}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div id="recaptcha-container"></div>
          
          {step === "phone" ? (
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  +91
                </span>
                <Input
                  className="rounded-l-none"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>
              <Button className="w-full mt-4" onClick={handleSendOtp} disabled={isLoading || phone.length !== 10}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <Input
                type="text"
                placeholder="XXXXXX"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center tracking-widest text-lg"
              />
              <Button className="w-full mt-4" onClick={handleVerifyOtp} disabled={isLoading || otp.length < 6}>
                {isLoading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button variant="ghost" className="w-full mt-2" onClick={() => setStep("phone")}>
                Change Mobile Number
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
