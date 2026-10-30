"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { ListingForm } from "@/components/listings/ListingForm.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { DEFAULT_COUNTRY } from "@/lib/catalogFilters.ts";
import type { ListingFormValues } from "@/lib/validation.ts";

export function NewListingPage() {
  const { userId, profile } = useAuth();
  const { listingService } = useServices();
  const router = useRouter();

  if (userId === null) return null;

  async function handleSubmit(values: ListingFormValues) {
    const listingId = await listingService.create(userId!, values);

    toast.success("Оголошення створено");
    router.push(`/listings/${listingId}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Нове оголошення</h1>

      <ListingForm
        initialValues={{
          address: { country: DEFAULT_COUNTRY, city: "", street: "", building: "", apartment: "" },
          description: "",
          ownerName: profile?.fullName ?? "",
          ownerPhone: "+380",
        }}
        submitLabel="Опублікувати"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </main>
  );
}
