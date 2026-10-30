"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { ListingForm } from "@/components/listings/ListingForm.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { useListing } from "@/hooks/useListing.ts";
import type { ListingFormValues } from "@/lib/validation.ts";

function Message({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{text}</p>

      <Link href="/my/listings" className={buttonVariants({ variant: "outline" })}>
        До моїх оголошень
      </Link>
    </main>
  );
}

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();
  const { listingService } = useServices();
  const listing = useListing(id);
  const router = useRouter();

  if (userId === null) return null;

  if (!listing) return <Message title="Оголошення не знайдено" text="Можливо, його вже скасовано." />;

  if (!listing.isOwnedBy(userId)) {
    return <Message title="Немає доступу" text="Редагувати оголошення може лише його власник." />;
  }

  if (!listing.isOpen) {
    return <Message title="Редагування недоступне" text="Спершу поновіть оголошення: закриті редагувати не можна." />;
  }

  async function handleSubmit(values: ListingFormValues) {
    await listingService.update(userId!, id, values);

    toast.success("Зміни збережено");
    router.push(`/listings/${id}`);
  }

  const data = listing.toData();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Редагування оголошення</h1>

      <ListingForm
        initialValues={{
          address: data.address,
          rooms: data.rooms,
          area: data.area,
          pricePerMonth: data.pricePerMonth,
          description: data.description,
          ownerName: data.ownerName,
          ownerPhone: data.ownerPhone,
        }}
        submitLabel="Зберегти"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </main>
  );
}
