import { Heart, Gift, Sparkles, ArrowDown } from "lucide-react";
import BouquetPreview from "./preview/BouquetPreview";
import { useBouquet } from "../state/BouquetContext";

const TRUST = [
  { icon: Heart, title: "Made with Love", note: "Hand-tied fresh every morning" },
  { icon: Gift, title: "Personalized Gifts", note: "Flowers, books & a message" },
  { icon: Sparkles, title: "Handcrafted for You", note: "No two bouquets are the same" },
];

export default function Hero() {
  const { state, totalFlowers, quote } = useBouquet();
  const currency = state.catalog?.settings.currency;

  return (
    <section id="top" className="relative overflow-hidden">
      {/* soft background wash */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 480px at 12% -8%, #F9E1E8 0%, transparent 60%), radial-gradient(900px 420px at 92% 4%, #E9EFE2 0%, transparent 55%), linear-gradient(180deg, #FBF7F0 0%, #FBF7F0 60%, #FDF6EE 100%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-16 lg:pt-16">
        <div className="fade-up">
          <span className="eyebrow">Flower &amp; book bouquets · handmade in Dhaka</span>
          <h1 className="mt-4 font-display text-[2.6rem] leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.1rem]">
            A Bouquet That
            <span className="block italic text-blush-600">Tells Your Story.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-brown-700/90 sm:text-lg">
            Choose your favorite flowers, wrap them in your favorite colors, and add a personal
            message — with the books they love tucked inside.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#customize" className="btn btn-primary px-7 py-4 text-base">
              Create Your Bouquet <ArrowDown size={17} />
            </a>
            <a href="#packages" className="btn btn-secondary px-7 py-4 text-base">
              Explore Ready-Made Bouquets
            </a>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {TRUST.map((item) => (
              <div key={item.title} className="card-soft flex items-start gap-3 px-4 py-3.5">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blush-100 text-blush-600">
                  <item.icon size={16} />
                </span>
                <div>
                  <dt className="text-sm font-semibold">{item.title}</dt>
                  <dd className="text-xs leading-snug text-brown-500">{item.note}</dd>
                </div>
              </div>
            ))}
          </dl>

          {quote && currency && (
            <p className="mt-6 text-sm text-brown-500">
              Signature bouquet from{" "}
              <strong className="text-brown-700">
                {currency.position === "before" ? currency.symbol : ""}
                {quote.total.toLocaleString("en-US")}
                {currency.position === "after" ? ` ${currency.symbol}` : ""}
              </strong>{" "}
              · {totalFlowers} flowers included in the default design
            </p>
          )}
        </div>

        <div className="fade-up relative mx-auto w-full max-w-[26rem] lg:max-w-none">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-blush-100 via-white to-sage-100 opacity-80 blur-2xl" />
          <BouquetPreview showNote={false} className="drop-shadow-2xl" />
          <p className="mt-2 text-center text-[0.7rem] italic text-brown-500">
            Illustration of our signature bouquet — yours will be handcrafted to match.
          </p>
        </div>
      </div>
    </section>
  );
}
