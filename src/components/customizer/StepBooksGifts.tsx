import { BookOpen, Minus, Plus } from "lucide-react";
import { useBouquet } from "../../state/BouquetContext";
import { formatMoney } from "../../../shared/pricing";
import type { AccessoryCategory } from "../../../shared/types";
import StepShell from "./StepShell";

const GROUPS: { category: AccessoryCategory; title: string; note: string }[] = [
  { category: "gift", title: "Add a little gift", note: "Chocolate, a teddy or a candle tucked into the wrap" },
  { category: "tag", title: "Gift tags & cards", note: "A swing tag the recipient can keep" },
  { category: "accessory", title: "Small accessories", note: "Ribbons, dried accents and keepsake details" },
];

export default function StepBooksGifts() {
  const { state, dispatch } = useBouquet();
  const catalog = state.catalog!;
  const s = catalog.settings;
  const books = state.config.books;
  const extraBooks = Math.max(0, books - s.includedBooks);

  return (
    <StepShell
      step={2}
      title="Books & little extras"
      hint={`Bouquets are wrapped around ${s.includedBooks} books — add more if you like, and choose any gifts you want included.`}
      error={state.fieldErrors.gifts || state.fieldErrors.books}
    >
      <div className="card-soft p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-brown-700 shadow-sm">
              <BookOpen size={18} />
            </span>
            <div>
              <h4 className="font-display text-lg leading-tight">Number of books</h4>
              <p className="text-[0.72rem] text-brown-500">
                {s.includedBooks} included in the base price
                {extraBooks > 0
                  ? ` · extra ${extraBooks} × ${formatMoney(s.currency, s.extraBookPrice)}`
                  : ` · ${formatMoney(s.currency, s.extraBookPrice)} each after that`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="stepper-btn"
              disabled={books <= 0}
              onClick={() => dispatch({ type: "books", books: books - 1 })}
              aria-label="Fewer books"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-semibold tabular-nums">{books}</span>
            <button
              type="button"
              className="stepper-btn"
              disabled={books >= 10}
              onClick={() => dispatch({ type: "books", books: books + 1 })}
              aria-label="More books"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="book-titles">
            Book preference (optional)
          </label>
          <input
            id="book-titles"
            className="field"
            placeholder="e.g. poetry, a novel by Murakami, or a children's classic"
            value={state.config.bookTitles}
            onChange={(e) => dispatch({ type: "book-titles", value: e.target.value })}
            maxLength={300}
          />
        </div>
      </div>

      {GROUPS.map((group) => {
        const items = catalog.accessories.filter((a) => a.category === group.category);
        if (items.length === 0) return null;
        return (
          <div key={group.category} className="mt-7">
            <h4 className="font-display text-xl">{group.title}</h4>
            <p className="text-xs text-brown-500">{group.note}</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {items.map((acc) => {
                const qty = state.config.gifts.find((g) => g.id === acc.id)?.qty ?? 0;
                return (
                  <div
                    key={acc.id}
                    className={`card-soft flex items-center justify-between gap-3 px-4 py-3 ${
                      qty > 0 ? "ring-2 ring-blush-300" : ""
                    } ${!acc.available ? "opacity-60" : ""}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{acc.name}</p>
                      <p className="text-[0.7rem] text-brown-500">
                        {formatMoney(s.currency, acc.price)}
                        {!acc.available && <span className="ml-1 font-semibold text-red-500">· Unavailable</span>}
                        {acc.description ? ` · ${acc.description}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className="stepper-btn"
                        disabled={!acc.available || qty === 0}
                        onClick={() => dispatch({ type: "gift-qty", id: acc.id, qty: qty - 1 })}
                        aria-label={`Remove ${acc.name}`}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-4 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        disabled={!acc.available || qty >= 20}
                        onClick={() => dispatch({ type: "gift-qty", id: acc.id, qty: qty + 1 })}
                        aria-label={`Add ${acc.name}`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </StepShell>
  );
}
