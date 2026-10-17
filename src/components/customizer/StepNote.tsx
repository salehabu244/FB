import { PenLine, Printer } from "lucide-react";
import { useBouquet } from "../../state/BouquetContext";
import { formatMoney } from "../../../shared/pricing";
import type { NoteType } from "../../../shared/types";
import StepShell from "./StepShell";

export default function StepNote() {
  const { state, dispatch } = useBouquet();
  const catalog = state.catalog!;
  const s = catalog.settings;
  const note = state.config.note;
  const length = note.message.length;
  const over = Math.max(0, length - s.noteCharLimit);
  const overCharge = over * s.noteExtraCharFee;

  const options: { type: NoteType; icon: typeof PenLine; title: string; note: string; fee: number }[] = [
    {
      type: "handwritten",
      icon: PenLine,
      title: "Handwritten note",
      note: "Written by hand on a card — included",
      fee: 0,
    },
    {
      type: "printed",
      icon: Printer,
      title: "Printed note",
      note: "Printed in an elegant typeface",
      fee: s.notePrintedFee,
    },
  ];

  return (
    <StepShell
      step={4}
      title="Personalize the note"
      hint="Say it in your own words — we'll copy it exactly onto the card."
      error={state.fieldErrors.note}
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((opt) => {
          const active = note.type === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => dispatch({ type: "note", patch: { type: opt.type } })}
              aria-pressed={active}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                active ? "border-blush-500 bg-blush-50 ring-2 ring-blush-200" : "border-black/10 bg-white"
              }`}
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-full ${
                  active ? "bg-blush-500 text-white" : "bg-blush-50 text-blush-600"
                }`}
              >
                <opt.icon size={17} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{opt.title}</span>
                <span className="block text-[0.72rem] text-brown-500">
                  {opt.note}
                  {opt.fee > 0 ? ` · +${formatMoney(s.currency, opt.fee)}` : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="card-soft p-4">
          <div className="flex items-center justify-between">
            <label className="label mb-0" htmlFor="note-message">
              Your message
            </label>
            <span className={`text-[0.7rem] ${over > 0 ? "font-semibold text-amber-600" : "text-brown-500"}`}>
              {length}/{s.noteCharLimit}
              {over > 0 && ` · +${formatMoney(s.currency, overCharge)} extra`}
            </span>
          </div>
          <textarea
            id="note-message"
            data-field="note"
            className="field mt-2 min-h-[130px] resize-y"
            placeholder="Wishing you a day as lovely as this bouquet…"
            value={note.message}
            maxLength={s.noteCharLimit + 600}
            onChange={(e) => dispatch({ type: "note", patch: { message: e.target.value } })}
          />
          {over > 0 && (
            <p className="mt-1.5 text-[0.72rem] text-amber-700">
              Beyond {s.noteCharLimit} characters each extra character costs{" "}
              {formatMoney(s.currency, s.noteExtraCharFee)}.
            </p>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="note-to">
                To (recipient)
              </label>
              <input
                id="note-to"
                className="field"
                placeholder="Mum, Sara, my love…"
                value={note.to}
                maxLength={60}
                onChange={(e) => dispatch({ type: "note", patch: { to: e.target.value } })}
              />
            </div>
            <div>
              <label className="label" htmlFor="note-from">
                From (sender)
              </label>
              <input
                id="note-from"
                className="field"
                placeholder="Your name"
                value={note.from}
                maxLength={60}
                onChange={(e) => dispatch({ type: "note", patch: { from: e.target.value } })}
              />
            </div>
          </div>
        </div>

        {/* live card preview */}
        <div className="grid place-items-center rounded-2xl bg-gradient-to-br from-blush-50 to-shell p-4">
          <div className="w-full max-w-[15rem] rotate-[-3deg] rounded-xl border border-brown-200 bg-ivory px-4 py-5 text-center shadow-lg">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-brown-300">
              {note.type === "printed" ? "Printed card" : "Handwritten"}
            </p>
            <p className="mt-3 font-script text-lg text-blush-700">
              {note.to ? `Dear ${note.to}` : "For you"}
            </p>
            <p className="mt-2 min-h-[3.2rem] whitespace-pre-wrap font-script text-[0.95rem] leading-snug text-brown-700">
              {note.message || "Your message will appear here…"}
            </p>
            <p className="mt-2 font-script text-sm text-brown-500">{note.from ? `— ${note.from}` : "— "}</p>
          </div>
        </div>
      </div>
    </StepShell>
  );
}
