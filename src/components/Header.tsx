import { useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { useBouquet } from "../state/BouquetContext";

const LINKS = [
  { href: "#customize", label: "Create Your Bouquet" },
  { href: "#packages", label: "Ready-Made Bouquets" },
  { href: "#policies", label: "How It Works" },
];

export default function Header() {
  const { state } = useBouquet();
  const [open, setOpen] = useState(false);
  const settings = state.catalog?.settings;
  const wa = (settings?.whatsappNumber || "").replace(/\D/g, "");

  return (
    <header className="sticky top-0 z-40 border-b border-brown-700/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          <LogoMark />
          <span className="leading-none">
            <span className="block font-display text-xl font-semibold tracking-wide sm:text-2xl">
              {settings?.businessName ?? "Bloom & Beyond"}
            </span>
            <span className="block text-[0.68rem] uppercase tracking-[0.22em] text-brown-500">
              {settings?.tagline ?? "Flower & book bouquets"}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brown-700 transition-colors hover:text-blush-600"
            >
              {link.label}
            </a>
          ))}
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sage btn-sm"
            >
              <MessageCircle size={15} /> WhatsApp us
            </a>
          )}
        </nav>

        <button
          type="button"
          className="rounded-full border border-brown-700/15 p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brown-700/10 bg-cream px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-brown-700 hover:bg-blush-50"
              >
                {link.label}
              </a>
            ))}
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sage mt-1"
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#F9E1E8" />
      <g transform="translate(24 24)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx={Math.cos((a * Math.PI) / 180) * 7}
            cy={Math.sin((a * Math.PI) / 180) * 7}
            rx="6.5"
            ry="4.5"
            fill={a % 120 === 0 ? "#EEB0C1" : "#D0708B"}
            transform={`rotate(${a + 90} ${Math.cos((a * Math.PI) / 180) * 7} ${Math.sin((a * Math.PI) / 180) * 7})`}
          />
        ))}
        <circle r="5" fill="#C9A227" />
        <circle r="2" fill="#FFF3D6" />
      </g>
    </svg>
  );
}
