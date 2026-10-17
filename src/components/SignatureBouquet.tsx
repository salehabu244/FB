import { Check, Feather, BookOpen, Palette, Ribbon } from "lucide-react";
import BouquetPreview from "./preview/BouquetPreview";
import { useBouquet } from "../state/BouquetContext";
import { computeQuote, defaultBouquetConfig, formatMoney } from "../../shared/pricing";

/**
 * The pre-configured signature bouquet every visitor sees first:
 * 5 flowers + 2 books, with a clear, honest breakdown of what the base
 * price includes (and what is an optional extra).
 */
export default function SignatureBouquet() {
  const { state, dispatch } = useBouquet();
  const catalog = state.catalog;
  if (!catalog) return null;

  const config = defaultBouquetConfig(catalog);
  const quote = computeQuote(config, catalog);
  const s = catalog.settings;

  const included = [
    { icon: Feather, label: "Fresh flower arrangement", note: `${quote.totalFlowers} stems`, priced: true },
    { icon: BookOpen, label: `Wrapped books`, note: `${config.books} books`, priced: true },
    { icon: Palette, label: "Decorative wrapping paper", note: catalog.wrapColors.find((w) => w.id === config.wrapColorId)?.name ?? "", priced: true },
    { icon: Ribbon, label: "Ribbon, floral tape & protective wrap", note: "Signature finishing", priced: true },
    { icon: Check, label: "Handwritten note card", note: "Optional — add your message", priced: false },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="card overflow-hidden lg:grid lg:grid-cols-2">
        <div className="relative bg-gradient-to-br from-blush-50 to-shell p-6 sm:p-10">
          <span className="eyebrow">Start here</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">The Signature Bouquet</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-brown-700/90">
            Our house arrangement: {quote.totalFlowers} coordinated flowers with {config.books} books,
            wrapped in blush pink paper. Loved by first-time customers — and easy to make your own.
          </p>

          <ul className="mt-6 space-y-2.5">
            {included.map((item) => (
              <li key={item.label} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-sage-700 shadow-sm">
                  <item.icon size={13} />
                </span>
                <span>
                  <strong className="font-semibold">{item.label}</strong>
                  <span className="block text-xs text-brown-500">
                    {item.note}
                    {item.priced ? "" : " · priced when added"}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="font-display text-4xl font-semibold text-blush-600">
              {formatMoney(s.currency, quote.total)}
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                dispatch({ type: "step", step: 1 });
                document.getElementById("customize")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Customize This Bouquet
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-brown-500">
            Base price covers the arrangement above. Extra books, premium papers, printed notes,
            gifts and delivery are added only if you choose them — every charge is shown before you
            order.
          </p>
        </div>

        <div className="relative flex items-center justify-center p-6 sm:p-10">
          <BouquetPreview config={config} catalog={catalog} showNote={false} className="w-full max-w-sm" />
        </div>
      </div>
    </section>
  );
}
