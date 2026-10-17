import { MessageCircle } from "lucide-react";
import { useBouquet } from "../state/BouquetContext";

/** Floating WhatsApp contact button (always visible, including in Facebook's in-app browser). */
export default function WhatsAppFab() {
  const { state } = useBouquet();
  const s = state.catalog?.settings;
  const wa = (s?.whatsappNumber || "").replace(/\D/g, "");
  if (!wa) return null;

  const text = encodeURIComponent(
    `Hi ${s?.businessName ?? "Bloom & Beyond"}! I'd like to ask about a bouquet 🌸`,
  );

  return (
    <a
      href={`https://wa.me/${wa}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={24} />
      <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-[#25D366]/30" />
    </a>
  );
}
