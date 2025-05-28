"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export const JsonEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    try {
      JSON.parse(newValue);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="relative h-full">
      <textarea
        className={cn(
          "w-full h-full p-4 font-mono text-sm resize-none bg-background border-0 focus:outline-none",
          error && "border-red-500"
        )}
        value={value}
        onChange={handleChange}
        spellCheck={false}
      />
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500/10 text-red-500 p-2 text-xs">
          {error}
        </div>
      )}
    </div>
  );
};
