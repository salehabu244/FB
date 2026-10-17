import { useContext, useMemo } from "react";
import type { BouquetConfig, Catalog } from "../../../shared/types";
import { BouquetContext } from "../../state/BouquetContext";
import { FlowerArt, ART_SIZE } from "./FlowerArt";

/**
 * Live bouquet preview — a layered SVG renderer.
 *
 * The same configuration always draws the same bouquet (deterministic
 * layout). Wrapping paper, books, flowers, ribbon, note card and gifts are
 * all separate layers that update live while the customer customizes.
 */

type Props = {
  config?: BouquetConfig;
  catalog?: Catalog;
  /** Smaller render used on package cards. */
  compact?: boolean;
  showNote?: boolean;
  className?: string;
};

const MAX_FLOWERS = 42;

type Placed = { key: string; art: string; color: string; accent: string; x: number; y: number; size: number };

function composeFlowers(config: BouquetConfig, catalog: Catalog): Placed[] {
  const placed: Placed[] = [];
  const cx = 200;
  const cy = 172;
  const golden = Math.PI * (3 - Math.sqrt(5));
  let index = 0;

  for (const sel of config.flowers) {
    const flower = catalog.flowers.find((f) => f.id === sel.flowerId);
    if (!flower || sel.qty <= 0) continue;
    const swatch = flower.colors.find((c) => c.name === sel.color) ?? flower.colors[0];
    for (let n = 0; n < sel.qty && index < MAX_FLOWERS; n += 1) {
      const r = 13.5 * Math.sqrt(index);
      const theta = index * golden + 0.7;
      placed.push({
        key: `${flower.id}-${n}`,
        art: flower.art,
        color: swatch?.hex ?? "#F2AFC2",
        accent: swatch?.accent ?? "#DE87A2",
        x: cx + Math.cos(theta) * r * 1.28,
        y: cy + Math.sin(theta) * r * 0.94,
        size: 52 * (ART_SIZE[flower.art] ?? 1),
      });
      index += 1;
    }
  }

  // Draw back flowers first so front ones overlap naturally.
  return placed.sort((a, b) => a.y - b.y);
}

function luminance(hex: string): number {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return 1;
  return (0.299 * parseInt(m[1], 16) + 0.587 * parseInt(m[2], 16) + 0.114 * parseInt(m[3], 16)) / 255;
}

function shade(hex: string, amount: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const ch = (v: string, extra: number) => Math.max(0, Math.min(255, Math.round(parseInt(v, 16) + extra)));
  return `rgb(${ch(m[1], 255 * amount)}, ${ch(m[2], 255 * amount)}, ${ch(m[3], 255 * amount)})`;
}

const BOOK_COVERS = ["#8CA17C", "#D0708B", "#9A6F48"];

export default function BouquetPreview({ config: configProp, catalog: catalogProp, compact, showNote = true, className }: Props) {
  const ctx = useContext(BouquetContext);
  const catalog = catalogProp ?? ctx?.state.catalog ?? null;
  const config = configProp ?? ctx?.state.config ?? null;

  const wrapColor = catalog?.wrapColors.find((w) => w.id === config?.wrapColorId);
  const wrapStyle = catalog?.wrapStyles.find((w) => w.id === config?.wrapStyleId);
  const placed = useMemo(
    () => (catalog && config ? composeFlowers(config, catalog) : []),
    [catalog, config],
  );

  if (!catalog || !config) {
    return (
      <div className={`relative overflow-hidden rounded-[2rem] bg-white/60 ${className ?? ""}`}>
        <div className="skeleton aspect-[4/5] w-full" />
      </div>
    );
  }

  const paper = wrapColor?.hex ?? "#F4CBD7";
  const dark = shade(paper, -0.12);
  const light = shade(paper, 0.16);
  const ribbon = luminance(paper) < 0.35 ? "#C9A227" : "#D0708B";
  const ribbonDark = luminance(paper) < 0.35 ? "#A9861C" : "#B45470";
  const lining = shade(paper, 0.32);
  const patternId = wrapColor?.pattern;
  const books = Math.min(3, Math.max(0, config.books || 0));
  const message = (config.note.message || "").trim();
  const gifts = config.gifts.filter((g) => g.qty > 0).slice(0, 4);

  const viewHeight = compact ? 480 : 490;

  return (
    <div className={`relative ${className ?? ""}`}>
      <svg
        viewBox={`0 0 400 ${viewHeight}`}
        className="block w-full"
        role="img"
        aria-label="Live illustration of your bouquet"
      >
        <defs>
          <radialGradient id="bb-bg" cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="100%" stopColor="#F9F1E9" />
          </radialGradient>

          <pattern id="bb-floral" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill={paper} />
            {Array.from({ length: 4 }, (_, i) => {
              const x = 10 + (i % 2) * 20;
              const y = 10 + Math.floor(i / 2) * 20;
              return (
                <g key={i} opacity="0.55">
                  {[0, 72, 144, 216, 288].map((a) => (
                    <ellipse
                      key={a}
                      cx={x + Math.cos((a * Math.PI) / 180) * 4}
                      cy={y + Math.sin((a * Math.PI) / 180) * 4}
                      rx="3"
                      ry="2.2"
                      fill="#fff"
                      transform={`rotate(${a} ${x} ${y})`}
                    />
                  ))}
                  <circle cx={x} cy={y} r="1.6" fill="#E9B7C6" />
                </g>
              );
            })}
          </pattern>

          <pattern id="bb-premium" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="26" height="26" fill={paper} />
            <line x1="0" y1="0" x2="0" y2="26" stroke="#C9A227" strokeWidth="1.4" opacity="0.5" />
            <circle cx="13" cy="13" r="2" fill="#C9A227" opacity="0.35" />
          </pattern>

          <pattern id="bb-kraft" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill={paper} />
            <line x1="0" y1="3" x2="12" y2="3" stroke="#00000022" strokeWidth="0.8" />
            <line x1="0" y1="9" x2="12" y2="9" stroke="#ffffff33" strokeWidth="0.8" />
          </pattern>

          <filter id="bb-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#6B4F3A" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x="0" y="0" width="400" height={viewHeight} fill="url(#bb-bg)" />

        {/* ---------------- wrapping paper, back wings ---------------- */}
        <g filter="url(#bb-shadow)">
          <polygon
            points="200,358 26,128 200,252"
            fill={patternId ? `url(#bb-${patternId})` : paper}
            stroke={dark}
            strokeWidth="1"
          />
          <polygon
            points="200,358 374,128 200,252"
            fill={patternId ? `url(#bb-${patternId})` : paper}
            stroke={dark}
            strokeWidth="1"
          />
          <polygon points="200,358 26,128 118,236" fill="#ffffff" opacity="0.18" />
          <polygon points="200,358 374,128 282,236" fill="#000000" opacity="0.05" />
        </g>

        {(wrapStyle?.id === "layered" || wrapStyle?.id === "premium") && (
          <g filter="url(#bb-shadow)">
            <polygon points="200,352 74,168 200,272" fill={dark} opacity="0.9" />
            <polygon points="200,352 326,168 200,272" fill={light} opacity="0.95" />
          </g>
        )}

        {wrapStyle?.id === "premium" && (
          <g>
            <polygon points="200,348 118,212 200,292" fill={lining} stroke="#C9A227" strokeWidth="1.2" />
            <polygon points="200,348 282,212 200,292" fill={lining} stroke="#C9A227" strokeWidth="1.2" />
          </g>
        )}

        {/* ---------------- books ---------------- */}
        {Array.from({ length: books }, (_, i) => {
          const spots = [
            { x: 126, y: 214, r: -15 },
            { x: 274, y: 220, r: 13 },
            { x: 200, y: 158, r: 3 },
          ];
          const spot = spots[i];
          const cover = BOOK_COVERS[i % BOOK_COVERS.length];
          return (
            <g key={`book-${i}`} transform={`translate(${spot.x} ${spot.y}) rotate(${spot.r})`} filter="url(#bb-shadow)">
              <rect x="-44" y="-56" width="88" height="112" rx="7" fill={cover} />
              <rect x="-44" y="-56" width="14" height="112" rx="6" fill="#00000035" />
              <rect x="36" y="-52" width="8" height="104" rx="3" fill="#F3EADB" />
              <rect x="-30" y="-34" width="52" height="4" rx="2" fill="#ffffffaa" />
              <rect x="-30" y="-26" width="38" height="3" rx="1.5" fill="#ffffff88" />
              <circle cx="-4" cy="18" r="12" fill="#ffffff30" />
              <path d="M-4 13c2-3 6-2 6 1 0 3-4 5-6 7-2-2-6-4-6-7 0-3 4-4 6-1z" fill="#ffffffcc" />
            </g>
          );
        })}

        {/* ---------------- stems ---------------- */}
        <g>
          {placed.map((f) => (
            <line
              key={`stem-${f.key}`}
              x1={f.x}
              y1={f.y + 10}
              x2={200}
              y2={344}
              stroke="#8CA17C"
              strokeWidth="3.4"
              strokeLinecap="round"
              opacity="0.85"
            />
          ))}
        </g>

        {/* ---------------- flowers ---------------- */}
        <g>
          {placed.map((f) => (
            <g key={f.key} transform={`translate(${f.x - f.size / 2} ${f.y - f.size / 2})`}>
              <FlowerArt art={f.art} color={f.color} accent={f.accent} size={f.size} />
            </g>
          ))}
        </g>

        {/* ---------------- front cone + tissue ---------------- */}
        <g filter="url(#bb-shadow)">
          <polygon points="150,338 250,338 216,462 184,462" fill={dark} />
          <polygon points="150,338 200,338 190,462 184,462" fill={light} opacity="0.8" />
          <polygon
            points="150,338 250,338 216,462 184,462"
            fill="none"
            stroke={shade(paper, -0.25)}
            strokeWidth="1.2"
          />
        </g>
        <g>
          <circle cx="168" cy="342" r="17" fill={shade(paper, 0.4)} />
          <circle cx="200" cy="334" r="19" fill="#FFFDF8" opacity="0.9" />
          <circle cx="232" cy="342" r="17" fill={shade(paper, 0.4)} />
        </g>

        {/* ---------------- ribbon ---------------- */}
        <g>
          <path d="M200 346 C186 328 160 326 156 342 C153 356 180 358 200 346z" fill={ribbon} stroke={ribbonDark} strokeWidth="1" />
          <path d="M200 346 C214 328 240 326 244 342 C247 356 220 358 200 346z" fill={ribbon} stroke={ribbonDark} strokeWidth="1" />
          <path d="M192 350 C182 372 176 386 168 400 C180 396 194 380 200 358z" fill={ribbonDark} opacity="0.9" />
          <path d="M208 350 C218 372 224 386 232 400 C220 396 206 380 200 358z" fill={ribbonDark} opacity="0.9" />
          <circle cx="200" cy="346" r="9" fill={ribbon} stroke={ribbonDark} strokeWidth="1.2" />
          <circle cx="197" cy="343" r="3" fill="#ffffff70" />
        </g>

        {/* ---------------- note card ---------------- */}
        {showNote && message && (
          <g transform="translate(258 320) rotate(-7)" filter="url(#bb-shadow)">
            <rect x="-60" y="-40" width="120" height="80" rx="9" fill="#FFFDF8" stroke="#E3C9AC" strokeWidth="1.2" />
            <path d="M0 -26c3-5 10-4 10 1 0 5-7 8-10 12-3-4-10-7-10-12 0-5 7-6 10-1z" fill="#E38FA5" />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fontFamily="'Dancing Script', cursive"
              fontSize="13"
              fill="#6B4F3A"
            >
              {config.note.to ? `Dear ${config.note.to}` : "For you"}
            </text>
            <text
              x="0"
              y="22"
              textAnchor="middle"
              fontFamily="'Dancing Script', cursive"
              fontSize="12"
              fill="#8a6f57"
            >
              {message.slice(0, 26)}
            </text>
            {message.length > 26 && (
              <text x="0" y="34" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="12" fill="#8a6f57">
                {message.slice(26, 52)}
              </text>
            )}
          </g>
        )}

        {/* ---------------- gifts & accessories ---------------- */}
        {gifts.map((g, i) => {
          const acc = catalog.accessories.find((a) => a.id === g.id);
          if (!acc) return null;
          const x = 44 + i * 44;
          const y = 432;
          return (
            <g key={g.id} transform={`translate(${x} ${y})`}>
              <circle r="19" fill="#FFFDF8" stroke="#E3C9AC" strokeWidth="1.2" />
              <GiftGlyph art={acc.art || acc.category} />
              {g.qty > 1 && (
                <>
                  <circle cx="14" cy="-13" r="8" fill="#D0708B" />
                  <text x="14" y="-9.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
                    {g.qty}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* ---------------- sparkles ---------------- */}
        <g opacity="0.7">
          {[
            [58, 88],
            [342, 96],
            [86, 300],
            [330, 320],
            [200, 60],
          ].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x} ${y - 7} l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z`}
              fill="#EEB0C1"
              opacity={i % 2 ? 0.6 : 0.9}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function GiftGlyph({ art }: { art: string }) {
  switch (art) {
    case "teddy":
      return (
        <g>
          <circle cx="-6" cy="-8" r="4.5" fill="#C89F78" />
          <circle cx="6" cy="-8" r="4.5" fill="#C89F78" />
          <circle cx="0" cy="0" r="9" fill="#C89F78" />
          <circle cx="-3" cy="-2" r="1.2" fill="#3E3028" />
          <circle cx="3" cy="-2" r="1.2" fill="#3E3028" />
          <circle cx="0" cy="3" r="1.6" fill="#6B4F3A" />
        </g>
      );
    case "chocolate":
      return (
        <g>
          <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#6B4F3A" />
          <rect x="-8" y="-6" width="7" height="5" rx="1.5" fill="#9A6F48" />
          <rect x="1" y="-6" width="7" height="5" rx="1.5" fill="#9A6F48" />
          <rect x="-8" y="1" width="7" height="5" rx="1.5" fill="#9A6F48" />
          <rect x="1" y="1" width="7" height="5" rx="1.5" fill="#9A6F48" />
        </g>
      );
    case "candle":
      return (
        <g>
          <rect x="-6" y="-3" width="12" height="13" rx="3" fill="#F4CBD7" />
          <path d="M0 -12c3 3 4 6 0 8-4-2-3-5 0-8z" fill="#F2B04B" />
          <line x1="0" y1="-4" x2="0" y2="-2" stroke="#6B4F3A" strokeWidth="1" />
        </g>
      );
    case "brooch":
      return (
        <g>
          <circle r="8" fill="#FFFDF8" stroke="#C9A227" strokeWidth="1.5" />
          <circle cx="-2.5" cy="-2.5" r="2.5" fill="#ffffff" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 11} cy={Math.sin((a * Math.PI) / 180) * 11} r="1.6" fill="#C9A227" />
          ))}
        </g>
      );
    case "tag":
      return (
        <g>
          <path d="M-8 -7h12l4 7-4 7h-12z" fill="#E3C9AC" stroke="#9A6F48" strokeWidth="1" />
          <circle cx="-4" cy="0" r="1.6" fill="#9A6F48" />
        </g>
      );
    case "accessory":
      return (
        <g>
          <path d="M-8 2c4-8 12-8 16 0" fill="none" stroke="#C9A227" strokeWidth="2" />
          <circle r="3" fill="#C9A227" />
        </g>
      );
    default:
      return (
        <g>
          <circle r="7" fill="#EEB0C1" />
          <circle cx="0" cy="0" r="2.5" fill="#FFFDF8" />
        </g>
      );
  }
}
