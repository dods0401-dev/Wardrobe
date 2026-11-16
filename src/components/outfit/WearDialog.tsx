"use client";

import { useState } from "react";
import type { Occasion, Outfit } from "@/domain/types";
import { OCCASIONS } from "@/domain/taxonomy";
import { useWardrobe, todayKey } from "@/store/useWardrobe";
import { addDays, toDateKey } from "@/lib/util";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Field, Input, Select } from "../ui/Field";
import { toast } from "@/store/toast";

export function WearDialog({ outfit, open, onClose }: { outfit: Outfit; open: boolean; onClose: () => void }) {
  const wear = useWardrobe((s) => s.wear);
  const removeWear = useWardrobe((s) => s.removeWear);
  const [date, setDate] = useState(todayKey());
  const [occasion, setOccasion] = useState<Occasion>(outfit.occasion);
  const max = todayKey();
  const min = toDateKey(addDays(new Date(), -365));
  const invalid = !date || date > max || date < min;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Log a wear"
      title={`Wearing “${outfit.name}”`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            disabled={invalid}
            onClick={() => {
              const entry = wear(outfit.id, date, occasion);
              if (entry) {
                toast({
                  title: "Logged to your lookbook",
                  description: "Usage counters and stats are updated.",
                  tone: "success",
                  action: { label: "Undo", onClick: () => removeWear(entry.id) },
                });
                onClose();
              }
            }}
          >
            Wear it
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-2">
          Recording when you actually wear a look keeps your history, item usage and rotation suggestions accurate.
        </p>
        <Field label="Date" htmlFor="wear-date" error={invalid ? "Choose a date within the last year, not in the future." : undefined}>
          <Input id="wear-date" type="date" value={date} max={max} min={min} onChange={(e) => setDate(e.target.value)} aria-invalid={invalid} />
        </Field>
        <Field label="Occasion" htmlFor="wear-occ">
          <Select id="wear-occ" value={occasion} onChange={(e) => setOccasion(e.target.value as Occasion)}>
            {OCCASIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
