import { useState } from "react";
import { Truck, ShieldCheck, RefreshCw, ChevronDown } from "lucide-react";
import { useBouquet } from "../state/BouquetContext";

const STEPS = [
  { title: "Design it", note: "Choose flowers, books, wrapping and your message." },
  { title: "We handcraft it", note: "Fresh stems, tied and wrapped the same day." },
  { title: "We confirm on WhatsApp", note: "A quick message to confirm the details." },
  { title: "Delivered with care", note: "Express today or within three days." },
];

export default function Policies() {
  const { state } = useBouquet();
  const s = state.catalog?.settings;
  if (!s) return null;

  const items = [
    { icon: ShieldCheck, title: "Privacy & data", body: s.privacySummary },
    { icon: Truck, title: "Delivery policy", body: s.deliveryPolicy },
    { icon: RefreshCw, title: "Changes & refunds", body: s.refundPolicy },
  ];

  return (
    <section id="policies" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
      <div className="text-center">
        <span className="eyebrow">Simple &amp; transparent</span>
        <h2 className="mt-3 font-display text-3xl sm:text-5xl">How It Works</h2>
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="card-soft p-5">
            <span className="font-display text-3xl font-semibold text-blush-300">{i + 1}</span>
            <h3 className="mt-1 font-display text-xl">{step.title}</h3>
            <p className="mt-1 text-sm text-brown-700/90">{step.note}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-3">
        {items.map((item) => (
          <details key={item.title} className="card-soft group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sage-700 shadow-sm">
                  <item.icon size={16} />
                </span>
                <span className="font-display text-lg">{item.title}</span>
              </span>
              <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-brown-700/90">{item.body}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
