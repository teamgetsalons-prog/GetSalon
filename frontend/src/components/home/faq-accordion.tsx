"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@getsalons/shared/utils";

export function FaqAccordion({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-card">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-medium text-fg">{faq.question}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-fg-faint transition-transform",
                open === i && "rotate-180 text-gold"
              )}
            />
          </button>
          {open === i && (
            <p className="px-5 pb-4 text-sm leading-relaxed text-fg-muted">
              {faq.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
