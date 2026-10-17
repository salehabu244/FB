import { Check } from "lucide-react";
import { useBouquet } from "../../state/BouquetContext";
import { formatMoney } from "../../../shared/pricing";
import StepShell from "./StepShell";

export default function StepWrapping() {
  const { state, dispatch } = useBouquet();
  const catalog = state.catalog!;
  const s = catalog.settings;

  return (
    <StepShell
      step={3}
      title="Choose your wrapping"
      hint="Pick a paper colour and a wrapping style — the preview changes as you tap."
      error={state.fieldErrors.wrapping}
    >
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {catalog.wrapColors.map((wrap) => {
          const active = state.config.wrapColorId === wrap.id;
          return (
            <button
              key={wrap.id}
              type="button"
              disabled={!wrap.available}
              onClick={() => dispatch({ type: "wrap-color", id: wrap.id })}
              aria-pressed={active}
              className={`group relative overflow-hidden rounded-2xl border p-2 text-left transition-all ${
                active ? "border-blush-500 ring-2 ring-blush-200" : "border-black/10"
              } ${!wrap.available ? "opacity-50" : ""}`}
            >
              <span
                className="block h-14 w-full rounded-xl border border-black/5"
                style={{
                  background: wrap.pattern
                    ? `repeating-linear-gradient(45deg, ${wrap.hex} 0 8px, rgba(255,255,255,0.55) 8px 10px)`
                    : wrap.hex,
                }}
              />
              <span className="mt-1.5 block text-[0.72rem] font-semibold leading-tight">{wrap.name}</span>
              <span className="block text-[0.66rem] text-brown-500">
                {wrap.price > 0 ? `+${formatMoney(s.currency, wrap.price)}` : "Included"}
                {!wrap.available ? " · Unavailable" : ""}
              </span>
              {active && (
                <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-blush-500 text-white">
                  <Check size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <h4 className="mt-8 font-display text-xl">Wrapping style</h4>
      <div className="mt-3 grid gap-2.5">
        {catalog.wrapStyles.map((style) => {
          const active = state.config.wrapStyleId === style.id;
          return (
            <button
              key={style.id}
              type="button"
              disabled={!style.available}
              onClick={() => dispatch({ type: "wrap-style", id: style.id })}
              aria-pressed={active}
              className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-all ${
                active ? "border-blush-500 bg-blush-50 ring-2 ring-blush-200" : "border-black/10 bg-white"
              } ${!style.available ? "opacity-50" : ""}`}
            >
              <span>
                <span className="block text-sm font-semibold">{style.name}</span>
                <span className="block text-[0.72rem] text-brown-500">{style.description}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-brown-700">
                {style.price > 0 ? `+${formatMoney(s.currency, style.price)}` : "Included"}
              </span>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
