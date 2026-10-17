import { useRef, useState } from "react";
import { ImagePlus, Loader2, ShieldCheck, Trash2, X } from "lucide-react";
import { useBouquet } from "../../state/BouquetContext";
import { apiSend, FN } from "../../lib/api";
import { setAnalyticsConsent } from "../../lib/analytics";
import StepShell from "./StepShell";

const MAX_BYTES = 3 * 1024 * 1024;

export default function StepSpecial() {
  const { state, dispatch } = useBouquet();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    setUploadError("");
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setUploadError("Please choose an image smaller than 3 MB.");
      return;
    }
    if (!/^image\//.test(file.type)) {
      setUploadError("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      const base64 = dataUrl.split(",")[1] ?? "";
      const res = await apiSend<{ photoKey: string }>(`${FN}/upload`, "POST", {
        dataBase64: base64,
        contentType: file.type,
      });
      dispatch({ type: "photo", key: res.photoKey, url: URL.createObjectURL(file) });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "The upload failed — please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <StepShell
      step={6}
      title="Tell us how you imagine your bouquet"
      hint="Specific colours, a mood, a budget, book themes, a style you saw somewhere — anything helps us make it perfect."
    >
      <div data-field="special">
        <label className="label" htmlFor="special">
          Your special requests
        </label>
        <textarea
          id="special"
          className="field min-h-[150px] resize-y"
          placeholder="e.g. Soft pastel colours, mostly roses, a poetry book if you have one, and please keep it under ৳3,500."
          value={state.specialRequest}
          maxLength={2000}
          onChange={(e) => dispatch({ type: "special", value: e.target.value })}
        />
        <p className="mt-1 text-[0.72rem] text-brown-500">{state.specialRequest.length}/2000 characters</p>
      </div>

      <div className="mt-5">
        <p className="label">Inspiration photo (optional)</p>
        {state.photoUrl ? (
          <div className="relative inline-flex items-center gap-3 rounded-2xl border border-brown-200 bg-white p-2">
            <img src={state.photoUrl} alt="Your inspiration" className="h-20 w-20 rounded-xl object-cover" />
            <div className="pr-2">
              <p className="text-sm font-semibold">Uploaded</p>
              <p className="text-[0.7rem] text-brown-500">Only the shop owner can see this image.</p>
            </div>
            <button
              type="button"
              className="rounded-full p-1.5 text-brown-500 hover:bg-blush-50"
              onClick={() => dispatch({ type: "photo" })}
              aria-label="Remove photo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-brown-300 bg-white/60 px-4 py-4 transition-colors hover:border-blush-400 hover:bg-blush-50">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            <span className="text-sm">
              <strong className="font-semibold">Upload a picture</strong>{" "}
              <span className="text-brown-500">— JPG, PNG or WEBP, up to 3 MB</span>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
        )}
        {uploadError && (
          <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-medium text-red-600">
            <X size={14} /> {uploadError}
          </p>
        )}
      </div>

      <div className="mt-7 space-y-3">
        <label
          data-field="consent"
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 ${
            state.fieldErrors.consent ? "border-red-300 bg-red-50" : "border-black/10 bg-white"
          }`}
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[#B45470]"
            checked={state.consent}
            onChange={(e) => dispatch({ type: "consent", value: e.target.checked })}
          />
          <span className="text-[0.82rem] leading-relaxed text-brown-700">
            I agree that {state.catalog?.settings.businessName ?? "the shop"} may use my name, phone number and
            address to prepare and deliver this order, and that I can be contacted about it on WhatsApp.
            <a href="#policies" className="ml-1 font-semibold text-blush-600 underline">
              Read the privacy &amp; order policy
            </a>
            .
            {state.fieldErrors.consent && (
              <span className="mt-1 block font-semibold text-red-600">{state.fieldErrors.consent}</span>
            )}
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[#B45470]"
            checked={state.analyticsConsent}
            onChange={(e) => {
              setAnalyticsConsent(e.target.checked);
              dispatch({ type: "analytics-consent", value: e.target.checked });
            }}
          />
          <span className="text-[0.8rem] leading-relaxed text-brown-700">
            Allow anonymous visit analytics (Facebook Pixel) so the shop knows which offers work. Optional.
          </span>
        </label>

        <p className="flex items-start gap-2 text-[0.74rem] text-brown-500">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-sage-700" />
          Your details are stored securely and are never sold. Inspiration photos are visible only to the
          shop owner.
        </p>
      </div>
    </StepShell>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
