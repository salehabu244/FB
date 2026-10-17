import { MapPin, MessageCircle, Phone } from "lucide-react";
import { LogoMark } from "./Header";
import { useBouquet } from "../state/BouquetContext";

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  const { state } = useBouquet();
  const s = state.catalog?.settings;
  const wa = (s?.whatsappNumber || "").replace(/\D/g, "");

  return (
    <footer className="mt-8 border-t border-brown-700/10 bg-shell/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={34} />
            <span className="font-display text-2xl">{s?.businessName ?? "Bloom & Beyond"}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-brown-700/90">
            {s?.tagline ?? "Handcrafted flower & book bouquets"} — designed by you, made by hand, delivered
            with care.
          </p>
          <div className="mt-4 flex gap-2">
            {s?.facebookPageUrl && (
              <a
                href={s.facebookPageUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-brown-700 shadow-sm"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            )}
            {s?.instagramUrl && (
              <a
                href={s.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-brown-700 shadow-sm"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            )}
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-sage-700 shadow-sm"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg">Quick links</h3>
          <ul className="mt-3 space-y-2 text-sm text-brown-700/90">
            <li>
              <a href="#customize" className="hover:text-blush-600">
                Create your bouquet
              </a>
            </li>
            <li>
              <a href="#packages" className="hover:text-blush-600">
                Ready-made bouquets
              </a>
            </li>
            <li>
              <a href="#policies" className="hover:text-blush-600">
                Delivery &amp; policies
              </a>
            </li>
            <li>
              <a href="/admin" className="hover:text-blush-600">
                Owner login
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg">Find us</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-brown-700/90">
            {s?.address && (
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0" /> {s.address}
              </li>
            )}
            {s?.contactPhone && (
              <li className="flex items-center gap-2">
                <Phone size={15} /> {s.contactPhone}
              </li>
            )}
            {s?.businessEmail && (
              <li className="flex items-center gap-2">
                <MessageCircle size={15} /> {s.businessEmail}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-brown-700/10 py-4 text-center text-xs text-brown-500">
        © {new Date().getFullYear()} {s?.businessName ?? "Bloom & Beyond"} · Fresh flowers, books and kind
        words.
      </div>
    </footer>
  );
}
