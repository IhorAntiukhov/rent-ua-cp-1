"use client";

import { useId, useState, type ComponentProps, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils.ts";

interface SuggestionInputProps extends Omit<ComponentProps<"input">, "value" | "onChange"> {
  value: string;
  suggestions: string[];
  onValueChange: (value: string) => void;
}

// Текстове поле з випадаючим списком підказок, що використовує шрифт сайту (на відміну від datalist)
export function SuggestionInput({ value, suggestions, onValueChange, className, ...inputProps }: SuggestionInputProps) {
  const listId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const isListVisible = isOpen && suggestions.length > 0;
  const activeIndex = highlightedIndex < suggestions.length ? highlightedIndex : -1;

  function select(suggestion: string) {
    onValueChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (suggestions.length === 0) return;

      event.preventDefault();
      setIsOpen(true);

      const step = event.key === "ArrowDown" ? 1 : -1;
      setHighlightedIndex((activeIndex + step + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && isListVisible && activeIndex >= 0) {
      event.preventDefault();
      select(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        {...inputProps}
        role="combobox"
        aria-expanded={isListVisible}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
      />

      {isListVisible && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              role="option"
              aria-selected={index === activeIndex}
              // mousedown, а не click: поле не втрачає фокус до вибору
              onMouseDown={(event) => {
                event.preventDefault();
                select(suggestion);
              }}
              className={cn(
                "cursor-pointer rounded-md px-2 py-1.5",
                index === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
              )}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
