import { useId, type ComponentProps } from "react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

// Поле форми з підписом і текстом помилки під ним
export function TextField({ label, error, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} aria-invalid={error ? true : undefined} {...inputProps} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
