import { Check, Sparkles } from "lucide-react";
import BouquetPreview from "./preview/BouquetPreview";
import { useBouquet } from "../state/BouquetContext";
import { configFromPackage, formatMoney, packagePrice } from "../../shared/pricing";

/**
 * "Choose a Bouquet Made for You" — ready-made packages. Selecting one loads
 * its configuration straight into the customizer so the customer can still
 * personalize it.
 */
export default function Packages() {
  const { state, dispatch } = useBouquet();
  const catalog = state.catalog;
  if (!catalog) return null;

  const packages = catalog.packages.filter((p) => p.active).sort((a, b) => a.sortOrder - b.sortOrder);
  if (packages.length === 0) return null;

  const choose = (packageId: string, step: number) => {
    const pkg = catalog.packages.find((p) => p.id === packageId);
    if (!pkg) return;
    dispatch({
      type: "apply-package",
      config: configFromPackage(pkg, catalog),
      packageId: pkg.id,
    });
    dispatch({ type: "step", step });
    document.getElementById("customize")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="packages" className="scroll-mt-20 bg-gradient-to-b from-cream to-shell/60 px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="eyebrow">No time to design?</span>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl">Choose a Bouquet Made for You</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-brown-700/90 sm:text-base">
            Four house favourites, ready to go. Pick one and still make it personal — every package opens in
            the customizer.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {packages.map((pkg) => {
            const price = packagePrice(pkg, catalog);
            const isPopular = pkg.id === "signature-bloom";
            return (
              <article
                key={pkg.id}
                className={`card relative flex flex-col overflow-hidden ${
                  isPopular ? "ring-2 ring-blush-300" : ""
                }`}
              >
                {isPopular && (
                  <span className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-blush-600 px-3 py-1 text-[0.68rem] font-semibold text-white shadow">
                    <Sparkles size={12} /> Most loved
                  </span>
                )}
                <div className="bg-gradient-to-br from-blush-50 to-shell/50 p-4">
                  <BouquetPreview
                    config={configFromPackage(pkg, catalog)}
                    catalog={catalog}
                    compact
                    showNote={false}
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-2xl">{pkg.name}</h3>
                  <p className="text-xs italic text-brown-500">{pkg.tagline}</p>
                  <p className="mt-2 text-sm leading-relaxed text-brown-700/90">{pkg.description}</p>

                  <ul className="mt-4 space-y-1.5">
                    {pkg.included.map((line) => (
                      <li key={line.label} className="flex items-start gap-2 text-[0.82rem]">
                        <Check size={14} className="mt-0.5 shrink-0 text-sage-700" />
                        <span>
                          {line.label}
                          {!line.priced && <span className="text-brown-500"> (optional extra)</span>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-brown-200 pt-4">
                    <div>
                      <p className="text-[0.66rem] uppercase tracking-[0.2em] text-brown-500">Starting at</p>
                      <p className="font-display text-3xl font-semibold text-blush-600">
                        {formatMoney(catalog.settings.currency, price)}
                      </p>
                    </div>
                    <p className="text-[0.66rem] text-brown-500">delivery added at checkout</p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button type="button" className="btn btn-primary flex-1" onClick={() => choose(pkg.id, 1)}>
                      Choose Package
                    </button>
                    <button type="button" className="btn btn-secondary flex-1" onClick={() => choose(pkg.id, 3)}>
                      Customize
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
