"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { SORT_FIELD_LABELS } from "@/lib/catalogFilters.ts";
import type { SortDirection, SortField } from "@/repositories/ListingQuery.ts";

const SORT_ITEMS = Object.entries(SORT_FIELD_LABELS).map(([value, label]) => ({ value, label }));

interface SortControlProps {
  id: string;
  field: SortField;
  direction: SortDirection;
  onChange: (field: SortField, direction: SortDirection) => void;
}

// Вибір поля сортування (дата, площа, ціна) і кнопка напрямку
export function SortControl({ id, field, direction, onChange }: SortControlProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>Сортування</Label>

      <div className="flex items-center gap-1">
        <Select
          items={SORT_ITEMS}
          value={field}
          onValueChange={(value) => {
            if (value !== null) onChange(value as SortField, direction);
          }}
        >
          <SelectTrigger id={id} className="w-40">
            <SelectValue />
          </SelectTrigger>

          <SelectContent alignItemWithTrigger={false} align="start">
            {SORT_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={direction === "asc" ? "За зростанням" : "За спаданням"}
          onClick={() => onChange(field, direction === "asc" ? "desc" : "asc")}
        >
          {direction === "asc" ? <ArrowUp /> : <ArrowDown />}
        </Button>
      </div>
    </div>
  );
}
