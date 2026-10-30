"use client";

import { NumberInput } from "@/components/forms/NumberInput.tsx";
import { SuggestionInput } from "@/components/forms/SuggestionInput.tsx";
import { SortControl } from "@/components/listings/SortControl.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AddressSearchLevel } from "@/domain/Address.ts";
import { useAddressSuggestions } from "@/hooks/useAddressSuggestions.ts";
import {
  changeAddressLevel,
  parsePrice,
  ROOM_OPTIONS,
  type CatalogFilters,
} from "@/lib/catalogFilters.ts";

interface CatalogFilterBarProps {
  filters: CatalogFilters;
  onChange: (changes: Partial<CatalogFilters>) => void;
  onReset: () => void;
}

const ADDRESS_FIELDS: Array<{ level: AddressSearchLevel; label: string; placeholder: string }> = [
  { level: "country", label: "Країна", placeholder: "Україна" },
  { level: "city", label: "Місто", placeholder: "Запоріжжя" },
  { level: "street", label: "Вулиця", placeholder: "Полякова" },
  { level: "building", label: "Будинок", placeholder: "21" },
];

// Крок кнопок «+» і «–» у полях ціни
const PRICE_STEP = 500;

// Поле адреси стає доступним, коли заповнені всі попередні рівні
function isLevelEnabled(level: AddressSearchLevel, filters: CatalogFilters): boolean {
  const levelIndex = ADDRESS_FIELDS.findIndex((field) => field.level === level);

  return ADDRESS_FIELDS.slice(0, levelIndex).every((field) => filters[field.level].trim() !== "");
}

function AddressField({
  level,
  label,
  placeholder,
  filters,
  onChange,
}: {
  level: AddressSearchLevel;
  label: string;
  placeholder: string;
  filters: CatalogFilters;
  onChange: (changes: Partial<CatalogFilters>) => void;
}) {
  const suggestions = useAddressSuggestions(level, filters);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`address-${level}`}>{label}</Label>

      <SuggestionInput
        id={`address-${level}`}
        value={filters[level]}
        suggestions={suggestions}
        placeholder={placeholder}
        disabled={!isLevelEnabled(level, filters)}
        onValueChange={(value) => onChange(changeAddressLevel(level, value))}
      />
    </div>
  );
}

export function CatalogFilterBar({ filters, onChange, onReset }: CatalogFilterBarProps) {
  const minPrice = parsePrice(filters.minPrice);
  const maxPrice = parsePrice(filters.maxPrice);
  const priceRangeInvalid = minPrice !== null && maxPrice !== null && minPrice > maxPrice;

  return (
    <div className="grid gap-4 rounded-xl border p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ADDRESS_FIELDS.map((field) => (
          <AddressField key={field.level} {...field} filters={filters} onChange={onChange} />
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Кімнати</span>

          <div className="flex gap-1">
            {["", ...ROOM_OPTIONS].map((option) => (
              <Button
                key={option || "all"}
                type="button"
                size="sm"
                variant={filters.rooms === option ? "default" : "outline"}
                aria-pressed={filters.rooms === option}
                onClick={() => onChange({ rooms: option })}
              >
                {option || "Усі"}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Ціна, грн/міс</span>

          <div className="flex items-center gap-2">
            <NumberInput
              placeholder="від"
              aria-label="Мінімальна ціна"
              aria-invalid={priceRangeInvalid || undefined}
              step={PRICE_STEP}
              value={filters.minPrice}
              onValueChange={(value) => onChange({ minPrice: value })}
              className="w-28"
            />
            <span className="text-muted-foreground">–</span>
            <NumberInput
              placeholder="до"
              aria-label="Максимальна ціна"
              aria-invalid={priceRangeInvalid || undefined}
              step={PRICE_STEP}
              value={filters.maxPrice}
              onValueChange={(value) => onChange({ maxPrice: value })}
              className="w-28"
            />
          </div>

          {priceRangeInvalid && <p className="text-sm text-destructive">Мінімальна ціна більша за максимальну</p>}
        </div>

        <SortControl
          id="catalog-sort"
          field={filters.sortField}
          direction={filters.sortDirection}
          onChange={(sortField, sortDirection) => onChange({ sortField, sortDirection })}
        />

        <Button type="button" variant="ghost" onClick={onReset} className="ml-auto">
          Скинути
        </Button>
      </div>
    </div>
  );
}
