"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils.ts";

interface NumberInputProps extends Omit<ComponentProps<"input">, "value" | "onChange" | "type" | "step" | "min"> {
  value: string;
  onValueChange: (value: string) => void;
  step?: number;
  min?: number;
}

// Числове поле з власними кнопками «+» і «–»: вони прозорі й мають колір тексту, на відміну від рідних
export function NumberInput({ value, onValueChange, step = 1, min = 0, className, ...inputProps }: NumberInputProps) {
  function stepBy(direction: 1 | -1) {
    const current = value.trim() === "" ? 0 : Number(value);
    const base = Number.isFinite(current) ? current : 0;

    onValueChange(String(Math.max(min, base + direction * step)));
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        {...inputProps}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="pr-7"
      />

      <div className="absolute inset-y-0 right-1 flex flex-col justify-center">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Збільшити"
          onClick={() => stepBy(1)}
          className="flex h-3.5 w-5 items-center justify-center bg-transparent text-foreground hover:text-primary"
        >
          <ChevronUp className="size-3.5" />
        </button>

        <button
          type="button"
          tabIndex={-1}
          aria-label="Зменшити"
          onClick={() => stepBy(-1)}
          className="flex h-3.5 w-5 items-center justify-center bg-transparent text-foreground hover:text-primary"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
