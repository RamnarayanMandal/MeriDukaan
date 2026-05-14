"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServices } from "@/hooks/useServices";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, LogIn, UserCheck, Wrench } from "lucide-react";
import { showSuccess, showError } from "@/lib/sweetAlert";
import AuthModal, { AuthUser } from "@/components/auth/AuthModal";
import { getUser, isAuthenticated } from "@/lib/auth";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit phone number required"),
  bikeModel: z.string().min(2, "Bike model is required"),
  serviceId: z.string().min(1, "Please select a service"),
  appointmentDate: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  issueDescription: z.string().optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
];

export default function BookServiceForm() {
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId");

  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const { data: servicesData, isLoading: isLoadingServices } = useServices({ isActive: true, limit: 100 });
  const createAppointment = useCreateAppointment();

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      bikeModel: "",
      serviceId: preselectedServiceId || "",
      appointmentDate: "",
      timeSlot: "",
      issueDescription: "",
    }
  });

  // On mount: check if already logged in and pre-fill
  useEffect(() => {
    if (isAuthenticated()) {
      const stored = getUser();
      if (stored) {
        setCurrentUser(stored as unknown as AuthUser);
        autoFill(stored as unknown as AuthUser);
      }
    }
  }, []);

  // Pre-select service from URL after services load
  useEffect(() => {
    if (preselectedServiceId && servicesData) {
      setValue("serviceId", preselectedServiceId);
    }
  }, [preselectedServiceId, servicesData, setValue]);

  const autoFill = (user: AuthUser) => {
    if (user.firstName) {
      setValue("customerName", `${user.firstName} ${user.lastName || ""}`.trim());
    }
    if (user.phoneNumber) {
      setValue("phoneNumber", user.phoneNumber.replace(/^\+91/, "").slice(0, 10));
    }
  };

  const onSubmit = async (values: BookingValues) => {
    // Force Login if not authenticated
    if (!isAuthenticated()) {
      setIsAuthOpen(true);
      return;
    }

    try {
      await createAppointment.mutateAsync(values);
      setIsSuccess(true);
      showSuccess("Booking Confirmed!", "Your appointment has been booked successfully.");
    } catch (error) {
      showError("Booking Failed", "Please try again.");
    }
  };

  const handleAuthSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user);
    autoFill(user);
    setIsAuthOpen(false);
    // Continue booking automatically
    setTimeout(() => handleSubmit(onSubmit)(), 100);
  };

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl border-t-4 border-t-green-500">
        <CardContent className="flex flex-col items-center py-12 px-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-2">
            Thank you.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Book Another Service
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Auth Banner */}
      {!currentUser ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Login to speed up booking</h4>
              <p className="text-blue-700/80 text-xs mt-0.5">
                Your name &amp; phone will be auto-filled. Track your service history.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAuthOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 text-sm"
          >
            <LogIn className="w-4 h-4 mr-2" /> Login / Sign Up
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-green-900 font-semibold text-sm">
              Logged in as {currentUser.firstName} {currentUser.lastName || ""}
            </p>
            <p className="text-green-700/80 text-xs">Details auto-filled from your account</p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        title="Login to Book Your Service"
      />

      {/* Booking Form */}
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-black">1</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    {...register('customerName')}
                    placeholder="Rahul Kumar"
                    className="h-11"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500">{errors.customerName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...register('phoneNumber')}
                    placeholder="9876543210"
                    maxLength={10}
                    className="h-11"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-black">2</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">Service Details</h3>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bikeModel">Bike Model *</Label>
                <Input
                  id="bikeModel"
                  {...register('bikeModel')}
                  placeholder="e.g. Royal Enfield Classic 350, Honda Activa"
                  className="h-11"
                />
                {errors.bikeModel && (
                  <p className="text-sm text-red-500">{errors.bikeModel.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="serviceId">Select Service *</Label>
                <Controller
                  name="serviceId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={isLoadingServices ? "Loading services..." : "Choose a service"} />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesData?.map((service: any) => (
                          <SelectItem key={service._id} value={service._id}>
                            <div className="flex items-center gap-2">
                              <Wrench className="w-3.5 h-3.5 text-blue-600" />
                              {service.name} — ₹{service.basePrice}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.serviceId && (
                  <p className="text-sm text-red-500">{errors.serviceId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="appointmentDate">Preferred Date *</Label>
                  <Input
                    type="date"
                    id="appointmentDate"
                    {...register('appointmentDate')}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-11"
                  />
                  {errors.appointmentDate && (
                    <p className="text-sm text-red-500">{errors.appointmentDate.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timeSlot">Time Slot *</Label>
                  <Controller
                    name="timeSlot"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.timeSlot && (
                    <p className="text-sm text-red-500">{errors.timeSlot.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issueDescription">Notes / Issue Description <span className="text-slate-400 text-xs">(optional)</span></Label>
                <Textarea
                  id="issueDescription"
                  {...register('issueDescription')}
                  placeholder="Describe any specific sounds, issues, or special instructions..."
                  rows={3}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30"
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Booking Appointment...
                </span>
              ) : (
                "Confirm Appointment →"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
