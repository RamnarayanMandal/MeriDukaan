"use client";

import React from "react";
import { Download, Smartphone, ShieldCheck, Star } from "lucide-react";
import { useSettings } from "@/context/ShopSettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DownloadAppPage() {
  const { settings } = useSettings();

  const handleDownloadAndroid = () => {
    // Replace with actual Play Store link or APK download link
    // window.location.href = "https://play.google.com/store/apps/details?id=com.yourshop.app";
    alert("Play Store link will go here. You can update this in the settings.");
  };

  const handleDownloadIOS = () => {
    // Replace with actual App Store link
    // window.location.href = "https://apps.apple.com/app/id123456789";
    alert("App Store link will go here. You can update this in the settings.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-16 h-16 object-contain" />
            ) : (
              <Smartphone className="w-12 h-12 text-blue-600" />
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Download the {settings.shopName} App
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Book appointments, track service history, and get real-time updates directly from your phone.
          </p>
        </div>

        {/* Download Buttons Card */}
        <Card className="border-none shadow-lg bg-white overflow-hidden rounded-3xl mx-auto max-w-md w-full">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Button 
                size="lg" 
                className="w-full h-14 rounded-xl text-lg gap-3 bg-gray-900 hover:bg-gray-800 text-white"
                onClick={handleDownloadAndroid}
              >
                <Download className="w-6 h-6" />
                Download for Android
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-14 rounded-xl text-lg gap-3 border-gray-200 hover:bg-gray-50"
                onClick={handleDownloadIOS}
              >
                <Download className="w-6 h-6" />
                Download for iPhone
              </Button>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Join thousands of satisfied customers!
            </p>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid sm:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto text-left">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Easy Booking</h3>
              <p className="text-sm text-gray-600 mt-1">Book services in just a few taps.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-green-50/50">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Records</h3>
              <p className="text-sm text-gray-600 mt-1">Access all your invoices & history safely.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-yellow-50/50">
            <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Live Updates</h3>
              <p className="text-sm text-gray-600 mt-1">Get instant alerts on your vehicle's status.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
