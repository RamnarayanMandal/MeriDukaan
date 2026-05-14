import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosClient";

export interface Appointment {
  _id: string;
  customerName: string;
  phoneNumber: string;
  bikeModel: string;
  serviceId: { _id: string; name: string; basePrice: number; estimatedDuration: number };
  appointmentDate: string;
  timeSlot: string;
  issueDescription?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  assignedMechanic?: string;
}

interface FetchAppointmentsParams {
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const useAppointments = (params?: FetchAppointmentsParams) => {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/appointments", { params });
      return data.data; // Assumes response is { data: { appointments, total, page, limit } }
    },
  });
};

export const useCreateAppointment = () => {
  return useMutation({
    mutationFn: async (appointmentData: any) => {
      const { data } = await axiosInstance.post("/appointments", appointmentData);
      return data.data;
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, assignedMechanic }: { id: string; status: string; assignedMechanic?: string }) => {
      const { data } = await axiosInstance.patch(`/appointments/${id}/status`, { status, assignedMechanic });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
