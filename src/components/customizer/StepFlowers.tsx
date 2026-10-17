import { Minus, Plus } from "lucide-react";
import type { Flower } from "../../../shared/types";
import { FlowerArt } from "../preview/FlowerArt";
import { useBouquet } from "../../state/BouquetContext";
import { formatMoney } from "../../../shared/pricing";
import StepShell from "./StepShell";

export default function StepFlowers() {
  const { state, dispatch, totalFlowers } = useBouquet();
  const catalog = state.catalog!;
  const s = catalog.settings;

  const selected = (id: string) => state.config.flowers.find((f) => f.flowerId === id);

  return (
    <StepShell
      step={1}
      title="Choose your flowers"
      hint={`Pick as many stems as you like — start with one variety or mix several. The default bouquet uses ${catalog.flowers.filter((f) => f.available).length ? "5" : "1"} flowers.`}
      error={state.fieldErrors.flowers}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-blush-50 px-4 py-3">
        <span className="text-sm font-semibold">Total flowers: {totalFlowers}</span>
        <span className="text-xs text-brown-500">
          {totalFlowers === 0 ? "Choose at least one stem" : "Everything updates live in the preview"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {catalog.flowers
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((flower) => (
            <FlowerCard
              key={flower.id}
              flower={flower}
              qty={selected(flower.id)?.qty ?? 0}
              color={selected(flower.id)?.color ?? flower.defaultColor}
              symbol={s.currency.symbol}
              position={s.currency.position}
              onQty={(qty) => dispatch({ type: "flower-qty", flowerId: flower.id, qty })}
              onColor={(color) => dispatch({ type: "flower-color", flowerId: flower.id, color })}
            />
          ))}
      </div>
    </StepShell>
  );
}

function FlowerCard({
  flower,
  qty,
  color,
  symbol,
  position,
  onQty,
  onColor,
}: {
  flower: Flower;
  qty: number;
  color: string;
  symbol: string;
  position: "before" | "after";
  onQty: (qty: number) => void;
  onColor: (color: string) => void;
}) {
  const swatch = flower.colors.find((c) => c.name === color) ?? flower.colors[0];
  const money = (n: number) => (position === "before" ? `${symbol}${n}` : `${n} ${symbol}`);

  return (
    <article
      className={`card-soft flex gap-3 p-3 transition-all ${
        qty > 0 ? "ring-2 ring-blush-300" : ""
      } ${!flower.available ? "opacity-70" : ""}`}
    >
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
        <FlowerArt art={flower.art} color={swatch?.hex ?? "#F2AFC2"} accent={swatch?.accent ?? "#DE87A2"} size={52} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-display text-lg leading-tight">{flower.name}</h4>
            <p className="text-[0.72rem] text-brown-500">
              {money(flower.pricePerStem)} per stem
              {!flower.available && <span className="ml-1 font-semibold text-red-500">· Unavailable today</span>}
            </p>
          </div>
          {flower.blurb && <p className="hidden max-w-[9rem] text-[0.68rem] italic leading-snug text-brown-500 sm:block">{flower.blurb}</p>}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {flower.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              disabled={!flower.available}
              onClick={() => onColor(c.name)}
              title={c.name}
              aria-label={`${flower.name} in ${c.name}`}
              aria-pressed={c.name === color}
              className={`h-6 w-6 rounded-full border transition-transform ${
                c.name === color ? "scale-110 border-brown-700 ring-2 ring-white" : "border-black/10"
              }`}
              style={{ background: c.hex }}
            />
          ))}
          <span className="ml-1 text-[0.7rem] text-brown-500">{color}</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-xs font-medium text-brown-700">
            {qty > 0 ? `${money(flower.pricePerStem * qty)}` : "—"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="stepper-btn"
              disabled={!flower.available || qty === 0}
              onClick={() => onQty(qty - 1)}
              aria-label={`Remove one ${flower.name}`}
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-sm font-semibold tabular-nums">{qty}</span>
            <button
              type="button"
              className="stepper-btn"
              disabled={!flower.available || qty >= 50}
              onClick={() => onQty(qty + 1)}
              aria-label={`Add one ${flower.name}`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
