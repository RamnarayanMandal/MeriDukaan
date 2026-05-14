"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
    useAllShops,
    useCreateShop,
    useDeleteShop,
    useCheckDeleteDependencies,
    useShopById,
    useUpdateLogoById,
    useUpdateShopById,
} from "@/hooks/useShop";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Edit,
    ArrowLeft,
    Plus,
    Clock,
    FileText,
    Hash,
    Phone,
    MapPin,
    Mail,
} from "lucide-react";

import CreateShopFrom from "@/components/shop/CreateShopFrom";

const shopSchema = z.object({
    shopName: z.string().min(1, "Shop name is required"),
    address: z.string().optional(),
    ownerName: z.string().min(1, "Owner name is required"),
    mobileNumbers: z.array(z.string().min(1, "Mobile number is required")).min(1),
    gstNo: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type ShopValues = z.infer<typeof shopSchema>;

export default function ShopDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const shopId = params.id as string;

    const { data: shop, isLoading, error } = useShopById(shopId);
    const { refetch: refetchShops } = useAllShops();

    const createShopMutation = useCreateShop();
    const updateShopMutation = useUpdateShopById();
    const updateLogoMutation = useUpdateLogoById();
    const deleteShopMutation = useDeleteShop();
    const checkDeleteMutation = useCheckDeleteDependencies();

    const [showShopForm, setShowShopForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [mobileNumbers, setMobileNumbers] = useState<string[]>([""]);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ShopValues>({
        resolver: zodResolver(shopSchema),
        defaultValues: { shopName: "", ownerName: "", address: "", mobileNumbers: [""], gstNo: "", email: "" }
    });

    useEffect(() => {
        if (shop && !isCreating) {
            const numbers = shop.mobileNumbers?.length ? shop.mobileNumbers : [""];
            reset({
                shopName: shop.shopName || "",
                ownerName: shop.ownerName || "",
                address: shop.address || "",
                mobileNumbers: numbers,
                gstNo: shop.gstNo || "",
                email: shop.email || "",
            });
            setMobileNumbers(numbers);
            setLogoPreview(shop.logoUrl || shop.logo || null);
        }
    }, [shop, isCreating, reset]);

    const handleAddNewShop = () => {
        setIsCreating(true); setShowShopForm(true); setLogoPreview(null); setPendingLogoFile(null); setMobileNumbers([""]);
        reset({ shopName: "", ownerName: "", address: "", mobileNumbers: [""], gstNo: "", email: "" });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setPendingLogoFile(file);
        const reader = new FileReader(); reader.onloadend = () => setLogoPreview(reader.result as string); reader.readAsDataURL(file);
        if (!isCreating) updateLogoMutation.mutate({ id: shopId, file });
    };

    const onSubmit = async (values: ShopValues) => {
        const payload = { ...values, mobileNumbers: values.mobileNumbers.filter(n => n.trim() !== "") };
        if (isCreating) {
            const newShop = await createShopMutation.mutateAsync(payload);
            if (pendingLogoFile) await updateLogoMutation.mutateAsync({ id: newShop._id, file: pendingLogoFile });
            setShowShopForm(false); setIsCreating(false); refetchShops(); router.push(`/admin/shop/${newShop._id}`);
        } else {
            await updateShopMutation.mutateAsync({ id: shopId, data: payload });
            setShowShopForm(false); refetchShops();
        }
    };

    const updateMobileNumber = (i: number, val: string) => {
        const arr = [...mobileNumbers]; arr[i] = val; setMobileNumbers(arr); setValue("mobileNumbers", arr);
    };
    const addMobileNumber = () => { const arr = [...mobileNumbers, ""]; setMobileNumbers(arr); setValue("mobileNumbers", arr); };
    const removeMobileNumber = (i: number) => { const arr = mobileNumbers.filter((_, idx) => idx !== i); const final = arr.length ? arr : [""]; setMobileNumbers(final); setValue("mobileNumbers", final); };

    const handleDelete = async () => {
        const res = await checkDeleteMutation.mutateAsync(shopId);
        if (!res.canDelete) { alert(res.reason); return; }
        await deleteShopMutation.mutateAsync(shopId);
        router.push("/admin/shop");
    };

    if (isLoading) return <p className="p-6">Loading...</p>;
    if (error || !shop) return <p className="p-6">Shop not found</p>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
            <Card className="mb-6">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {logoPreview ? <img src={logoPreview} alt="Logo" className="h-16 w-16 sm:h-20 sm:w-20 rounded border object-cover" /> : <div className="h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center bg-gray-100 rounded"><Building2 className="h-6 w-6 text-gray-400" /></div>}
                        <div className="min-w-0"><CardTitle className="text-lg sm:text-xl truncate">{shop.shopName}</CardTitle><CardDescription className="text-sm">Owner: <b>{shop.ownerName}</b></CardDescription></div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        <Button onClick={() => setShowShopForm(true)} size="sm"><Edit className="h-4 w-4 mr-1" />Edit</Button>
                        <Button variant="outline" size="sm" onClick={handleAddNewShop}><Plus className="h-4 w-4 mr-1" />Add New</Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contact</CardTitle></CardHeader><CardContent className="space-y-3">{shop.mobileNumbers?.map((m: string, i: number) => <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded"><Phone className="h-4 w-4 text-gray-400" />{m}</div>)} {shop.email && <div className="flex items-center gap-2 bg-gray-50 p-2 rounded"><Mail className="h-4 w-4 text-gray-400" />{shop.email}</div>}</CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Address</CardTitle></CardHeader><CardContent>{shop.address ? <div className="flex gap-2 bg-gray-50 p-2 rounded"><MapPin className="h-4 w-4 text-gray-400 mt-1" />{shop.address}</div> : <p className="text-gray-400">No address</p>}</CardContent></Card>
                {shop.gstNo && <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> GST Info</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2 bg-gray-50 p-2 rounded font-mono"><Hash className="h-4 w-4 text-gray-400" />{shop.gstNo}</div></CardContent></Card>}
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Timeline</CardTitle></CardHeader><CardContent className="space-y-2"><div className="bg-gray-50 p-2 rounded">Created: {new Date(shop.createdAt).toLocaleDateString()}</div><div className="bg-gray-50 p-2 rounded">Updated: {new Date(shop.updatedAt).toLocaleDateString()}</div></CardContent></Card>
            </div>

            <CreateShopFrom open={showShopForm} onOpenChange={setShowShopForm} register={register} errors={errors} handleSubmit={handleSubmit(onSubmit)} logoPreview={logoPreview} handleLogoChange={handleLogoChange} isPending={isCreating ? createShopMutation.isPending : updateShopMutation.isPending} updateLogoPending={updateLogoMutation.isPending} mobileNumbers={mobileNumbers} addMobileNumber={addMobileNumber} removeMobileNumber={removeMobileNumber} updateMobileNumber={updateMobileNumber} isCreating={isCreating} />
        </div>
    );
}
