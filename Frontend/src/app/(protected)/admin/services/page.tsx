"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useServices, useDeleteService } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Wrench } from "lucide-react";
import { showError } from "@/lib/sweetAlert";

export default function ServicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useServices({
    search: search || undefined,
    page,
    limit,
  });

  const deleteService = useDeleteService();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteService.mutateAsync(id);
      } catch (error) {
        showError("Failed to delete service");
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Garage Services</h1>
          <p className="text-gray-600 mt-1">Manage repair and maintenance services</p>
        </div>
        <Button onClick={() => router.push("/admin/services/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full md:w-1/3"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data && data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((service: any) => (
            <Card key={service._id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md border flex items-center justify-center text-gray-400 bg-gray-50">
                      <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{service.category}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">₹{service.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{service.estimatedDuration} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={service.isActive ? "text-green-600" : "text-red-600"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2 items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">SEO Status</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${service.seoTitle ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {service.seoTitle ? 'OPTIMIZED' : 'PENDING'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/services/${service._id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(service._id, service.name)}
                    disabled={deleteService.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No services found</p>
            <Button className="mt-4" onClick={() => router.push("/admin/services/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
