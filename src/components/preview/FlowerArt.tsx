/**
 * Deterministic SVG flower renderer.
 *
 * Every variety is drawn from vector shapes (no external images), so the
 * preview is fast, works offline and never breaks in Facebook's in-app
 * browser. The same configuration always produces the same illustration.
 */

type Props = {
  art: string;
  color: string;
  accent: string;
  size?: number;
  className?: string;
};

const RAD = Math.PI / 180;

function ring(count: number, distance: number, rx: number, ry: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const angle = offset + (i * 360) / count;
    const rad = angle * RAD;
    return {
      cx: 50 + Math.cos(rad) * distance,
      cy: 50 + Math.sin(rad) * distance,
      rx,
      ry,
      angle: angle + 90,
    };
  });
}

function darken(hex: string, amount = 0.22): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const ch = (v: string) => Math.max(0, Math.round(parseInt(v, 16) * (1 - amount)));
  return `rgb(${ch(m[1])}, ${ch(m[2])}, ${ch(m[3])})`;
}

function lighten(hex: string, amount = 0.25): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const ch = (v: string) => Math.min(255, Math.round(parseInt(v, 16) + 255 * amount));
  return `rgb(${ch(m[1])}, ${ch(m[2])}, ${ch(m[3])})`;
}

export function FlowerArt({ art, color, accent, size = 56, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {drawFlower(art, color, accent)}
    </svg>
  );
}

function drawFlower(art: string, color: string, accent: string) {
  switch (art) {
    /* ---------------------------------------------------------------- */
    case "rose":
      return (
        <g>
          {ring(6, 24, 17, 12, 10).map((p, i) => (
            <ellipse key={`r1-${i}`} {...p} fill={color} stroke={darken(color, 0.12)} strokeWidth="0.6" />
          ))}
          {ring(5, 14, 13, 10, 40).map((p, i) => (
            <ellipse key={`r2-${i}`} {...p} fill={accent} />
          ))}
          <circle cx="50" cy="50" r="8" fill={darken(accent, 0.25)} />
          <path
            d="M50 44c4 0 6 3 6 6s-2 6-6 6-6-3-6-6c0-2 2-4 4-4s4 1 4 3-1 3-3 3"
            fill="none"
            stroke={lighten(accent, 0.25)}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "peony":
      return (
        <g>
          {ring(11, 30, 15, 11, 8).map((p, i) => (
            <ellipse key={`p1-${i}`} {...p} fill={color} opacity="0.95" />
          ))}
          {ring(9, 21, 13, 10, 24).map((p, i) => (
            <ellipse key={`p2-${i}`} {...p} fill={lighten(color, 0.12)} />
          ))}
          {ring(7, 12, 10, 8, 46).map((p, i) => (
            <ellipse key={`p3-${i}`} {...p} fill={accent} opacity="0.9" />
          ))}
          <circle cx="50" cy="50" r="6" fill={lighten(accent, 0.2)} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle
              key={`c-${a}`}
              cx={50 + Math.cos(a * RAD) * 3.4}
              cy={50 + Math.sin(a * RAD) * 3.4}
              r="1.5"
              fill="#F6D98B"
            />
          ))}
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "ranunculus":
      return (
        <g>
          {ring(13, 29, 12, 7, 5).map((p, i) => (
            <ellipse key={`a1-${i}`} {...p} fill={color} />
          ))}
          {ring(11, 21, 10, 6, 22).map((p, i) => (
            <ellipse key={`a2-${i}`} {...p} fill={lighten(color, 0.1)} />
          ))}
          {ring(9, 13, 8, 5, 40).map((p, i) => (
            <ellipse key={`a3-${i}`} {...p} fill={accent} />
          ))}
          <circle cx="50" cy="50" r="5" fill={darken(accent, 0.2)} />
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "lily":
      return (
        <g>
          {ring(6, 20, 12, 24, 0).map((p, i) => (
            <ellipse
              key={`l-${i}`}
              {...p}
              fill={color}
              stroke={accent}
              strokeWidth="0.8"
              opacity="0.97"
            />
          ))}
          <circle cx="50" cy="50" r="6" fill={lighten(accent, 0.15)} />
          {[30, 90, 150, 210, 270, 330].map((a) => (
            <g key={`s-${a}`}>
              <line
                x1="50"
                y1="50"
                x2={50 + Math.cos(a * RAD) * 14}
                y2={50 + Math.sin(a * RAD) * 14}
                stroke={darken(accent, 0.15)}
                strokeWidth="1.1"
              />
              <circle cx={50 + Math.cos(a * RAD) * 15} cy={50 + Math.sin(a * RAD) * 15} r="2" fill="#C9922E" />
            </g>
          ))}
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "gerbera":
      return (
        <g>
          {ring(16, 26, 7, 22, 11).map((p, i) => (
            <ellipse key={`g-${i}`} {...p} fill={i % 2 ? color : lighten(color, 0.12)} />
          ))}
          <circle cx="50" cy="50" r="13" fill={darken(color, 0.35)} />
          <circle cx="50" cy="50" r="8" fill={darken(color, 0.5)} />
          <circle cx="50" cy="50" r="4" fill={accent} />
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "tulip":
      return (
        <g>
          <path
            d="M50 74c-12 0-19-9-19-21 0-12 6-21 19-21s19 9 19 21c0 12-7 21-19 21z"
            fill={color}
          />
          <path d="M38 52c0-13 5-22 12-24-6 6-8 14-8 24 0 10 2 18 8 24-7-2-12-11-12-24z" fill={accent} />
          <path d="M62 52c0-13-5-22-12-24 6 6 8 14 8 24 0 10-2 18-8 24 7-2 12-11 12-24z" fill={lighten(color, 0.14)} />
          <path d="M50 24c7 2 12 11 12 24v26c0 12-5 21-12 21" fill="none" stroke={darken(color, 0.1)} strokeWidth="1" />
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "sunflower":
      return (
        <g>
          {ring(14, 28, 8, 24, 0).map((p, i) => (
            <ellipse key={`sf-${i}`} {...p} fill={i % 2 ? color : darken(color, 0.08)} />
          ))}
          <circle cx="50" cy="50" r="16" fill={accent} />
          <circle cx="50" cy="50" r="11" fill={darken(accent, 0.3)} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = i * 30 * RAD;
            return <circle key={`sd-${i}`} cx={50 + Math.cos(a) * 7} cy={50 + Math.sin(a) * 7} r="1.2" fill="#8A5B33" opacity="0.7" />;
          })}
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "carnation":
      return (
        <g>
          {ring(14, 26, 11, 9, 0).map((p, i) => (
            <ellipse key={`cn-${i}`} {...p} fill={i % 2 ? color : lighten(color, 0.1)} />
          ))}
          {ring(11, 17, 9, 8, 16).map((p, i) => (
            <ellipse key={`cn2-${i}`} {...p} fill={accent} opacity="0.95" />
          ))}
          <path
            d="M50 38c7 0 12 5 12 12s-5 12-12 12-12-5-12-12c0-4 3-8 6-8s5 2 5 5-2 5-4 5"
            fill={darken(accent, 0.15)}
            stroke={lighten(accent, 0.2)}
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "hydrangea":
      return (
        <g>
          {Array.from({ length: 14 }, (_, i) => {
            const a = i * 2.399;
            const r = 4 + 5.6 * Math.sqrt(i);
            const x = 50 + Math.cos(a) * r * 1.15;
            const y = 50 + Math.sin(a) * r;
            const fill = i % 3 === 0 ? accent : i % 3 === 1 ? color : lighten(color, 0.15);
            return (
              <g key={`h-${i}`}>
                {ring(4, 3.2, 3.6, 2.8, i * 15).map((p, j) => (
                  <ellipse key={j} cx={x + (p.cx - 50)} cy={y + (p.cy - 50)} rx={p.rx} ry={p.ry} fill={fill} transform={`rotate(${p.angle} ${x + (p.cx - 50)} ${y + (p.cy - 50)})`} />
                ))}
                <circle cx={x} cy={y} r="1.5" fill="#FFF3D6" />
              </g>
            );
          })}
        </g>
      );

    /* ---------------------------------------------------------------- */
    case "babysbreath":
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const a = i * 2.399;
            const r = 5 + 6.4 * Math.sqrt(i);
            const x = 50 + Math.cos(a) * r * 1.2;
            const y = 50 + Math.sin(a) * r;
            return (
              <g key={`b-${i}`}>
                <line x1="50" y1="56" x2={x} y2={y} stroke="#A9B99A" strokeWidth="0.9" />
                {ring(5, 3, 2.4, 2, i * 20).map((p, j) => (
                  <ellipse key={j} cx={x + (p.cx - 50)} cy={y + (p.cy - 50)} rx={p.rx} ry={p.ry} fill={j % 2 ? color : accent} transform={`rotate(${p.angle} ${x + (p.cx - 50)} ${y + (p.cy - 50)})`} />
                ))}
              </g>
            );
          })}
        </g>
      );

    /* ---------------------------------------------------------------- */
    default:
      return (
        <g>
          {ring(6, 22, 15, 12, 0).map((p, i) => (
            <ellipse key={`d-${i}`} {...p} fill={color} />
          ))}
          <circle cx="50" cy="50" r="8" fill={accent} />
        </g>
      );
  }
}

/** Relative diameter used by the preview when composing the bouquet. */
export const ART_SIZE: Record<string, number> = {
  rose: 1,
  peony: 1.18,
  ranunculus: 1.02,
  lily: 1.12,
  gerbera: 1.05,
  tulip: 0.95,
  sunflower: 1.15,
  carnation: 1,
  hydrangea: 1.24,
  babysbreath: 0.92,
};
