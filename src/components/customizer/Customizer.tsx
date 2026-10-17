import { ArrowLeft, ArrowRight, AlertTriangle, RotateCcw } from "lucide-react";
import BouquetPreview from "../preview/BouquetPreview";
import { useBouquet } from "../../state/BouquetContext";
import { deliveryById, formatMoney } from "../../../shared/pricing";
import StepFlowers from "./StepFlowers";
import StepBooksGifts from "./StepBooksGifts";
import StepWrapping from "./StepWrapping";
import StepNote from "./StepNote";
import StepDelivery from "./StepDelivery";
import StepSpecial from "./StepSpecial";
import StepReview from "./StepReview";

const STEPS = [
  { n: 1, label: "Flowers" },
  { n: 2, label: "Books & gifts" },
  { n: 3, label: "Wrapping" },
  { n: 4, label: "Note" },
  { n: 5, label: "Delivery" },
  { n: 6, label: "Your ideas" },
  { n: 7, label: "Review" },
];

export default function Customizer() {
  const { state, dispatch, quote, totalFlowers, expressAvailable } = useBouquet();

  if (state.phase === "loading") {
    return (
      <section id="customize" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="skeleton h-[28rem] rounded-[2rem]" />
          <div className="skeleton h-[28rem] rounded-[2rem]" />
        </div>
      </section>
    );
  }

  if (state.phase === "error" || !state.catalog) {
    return (
      <section id="customize" className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="card p-8">
          <AlertTriangle className="mx-auto text-amber-500" />
          <h2 className="mt-3 font-display text-2xl">We couldn't load the shop</h2>
          <p className="mt-2 text-sm text-brown-700">{state.loadError}</p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => window.location.reload()}>
            <RotateCcw size={16} /> Try again
          </button>
        </div>
      </section>
    );
  }

  const catalog = state.catalog;
  const s = catalog.settings;
  const option = deliveryById(catalog, state.config.deliveryOptionId);

  return (
    <section id="customize" className="relative scroll-mt-20 px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="eyebrow">The fun part</span>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl">Create Your Own Bouquet</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-brown-700/90 sm:text-base">
            Seven short steps. Your bouquet and price update live as you choose — nothing is hidden until
            the very end.
          </p>
        </div>

        {/* progress */}
        <ol className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
          {STEPS.map((step) => {
            const active = state.step === step.n;
            const done = state.step > step.n;
            return (
              <li key={step.n} className="shrink-0">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "step", step: step.n })}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? "bg-blush-600 text-white shadow-md"
                      : done
                        ? "bg-sage-100 text-sage-700"
                        : "bg-white text-brown-500 border border-black/10"
                  }`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-[0.65rem]">
                    {step.n}
                  </span>
                  {step.label}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          {/* steps */}
          <div id="step-panel" className="card scroll-mt-24 p-5 sm:p-7">
            {state.step === 1 && <StepFlowers />}
            {state.step === 2 && <StepBooksGifts />}
            {state.step === 3 && <StepWrapping />}
            {state.step === 4 && <StepNote />}
            {state.step === 5 && <StepDelivery />}
            {state.step === 6 && <StepSpecial />}
            {state.step === 7 && <StepReview />}

            {state.step < 7 && (
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={state.step === 1}
                  onClick={() => {
                    dispatch({ type: "step", step: Math.max(1, state.step - 1) });
                    document.getElementById("step-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={state.step === 1 && totalFlowers === 0}
                  onClick={() => {
                    dispatch({ type: "step", step: Math.min(7, state.step + 1) });
                    document.getElementById("step-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* live preview + price */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <BouquetPreview showNote={state.step >= 4} />
              <p className="px-4 pb-2 text-center text-[0.68rem] italic text-brown-500">
                Illustration of your design — the finished bouquet is handcrafted and will look similar,
                not identical.
              </p>
              <div className="divider" />
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-brown-500">Your bouquet</p>
                    <p className="font-display text-2xl">
                      {totalFlowers} flower{totalFlowers === 1 ? "" : "s"} · {state.config.books} book
                      {state.config.books === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => dispatch({ type: "reset" })}
                    title="Reset to the signature bouquet"
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-xs text-brown-600">
                  {quote?.lines.slice(0, 8).map((line) => (
                    <div key={line.label} className="flex justify-between gap-3">
                      <span className="truncate">{line.label}</span>
                      <span className="tabular-nums">
                        {line.amount === 0 ? "Included" : formatMoney(s.currency, line.amount)}
                      </span>
                    </div>
                  ))}
                  {quote && quote.lines.length > 8 && (
                    <p className="text-[0.68rem] text-brown-500">+ {quote.lines.length - 8} more lines…</p>
                  )}
                </div>

                <div className="mt-3 flex items-end justify-between border-t border-brown-200 pt-3">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-brown-500">
                      Delivery: {option?.name.split("—")[0]?.trim() ?? "—"}
                      {option && option.fee > 0 ? ` · ${formatMoney(s.currency, option.fee)}` : ""}
                    </p>
                    {!expressAvailable && (
                      <p className="text-[0.66rem] text-amber-700">
                        Today's express cutoff ({s.expressCutoff}) has passed.
                      </p>
                    )}
                  </div>
                  <p className="font-display text-3xl font-semibold text-blush-600">
                    {quote ? formatMoney(s.currency, quote.total) : "—"}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
