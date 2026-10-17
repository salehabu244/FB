import { ArrowRight } from "lucide-react";
import { useBouquet } from "../state/BouquetContext";
import { formatMoney } from "../../shared/pricing";

/**
 * Sticky order summary for phones — the total and the next action are always
 * one tap away while the customer customizes.
 */
export default function StickyBar() {
  const { state, dispatch, quote, totalFlowers } = useBouquet();
  if (!state.catalog || state.phase !== "ready") return null;
  const s = state.catalog.settings;

  const next = () => {
    dispatch({ type: "step", step: Math.min(7, state.step + 1) });
    document.getElementById("step-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brown-700/10 bg-cream/95 px-4 py-2.5 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.66rem] uppercase tracking-[0.18em] text-brown-500">
            {totalFlowers} flowers · {state.config.books} books · step {state.step}/7
          </p>
          <p className="font-display text-xl font-semibold text-blush-600">
            {quote ? formatMoney(s.currency, quote.total) : "—"}
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm shrink-0" onClick={next}>
          {state.step === 7 ? "Place order" : "Continue"} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
