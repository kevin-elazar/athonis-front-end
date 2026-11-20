import { useId } from "react";
import { cn } from "@/lib/utils/cn";

export type BrandMarkProps = {
  /** Lado do quadrado, em px. */
  size?: number;
  /**
   * `badge`: a marca branca num quadrado azul arredondado (menu, login, ícone).
   * `glyph`: só o desenho, na cor do texto (`currentColor`).
   */
  variant?: "badge" | "glyph";
  className?: string;
  title?: string;
};

/**
 * Marca do Athonis: um "A" feito de rota. As pernas são a estrada, a travessa
 * tracejada é o trecho planejado e as bases são paradas. É o mesmo desenho
 * do ícone do aplicativo (AthonisMobile/assets/brand/gerar_marca.py).
 */
export function BrandMark({
  size = 32,
  variant = "badge",
  className,
  title = "Athonis",
}: BrandMarkProps) {
  const gradientId = `athonis-brand-${useId().replace(/:/g, "")}`;
  const badge = variant === "badge";
  const ink = badge ? "#ffffff" : "currentColor";
  // No badge o desenho encolhe para respirar dentro do quadrado.
  const scale = badge ? 0.74 : 1;
  const transform = `translate(${50 - 50 * scale} ${50 - 50 * scale}) scale(${scale})`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      {badge && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4a76f0" />
              <stop offset="0.55" stopColor="#2f5de3" />
              <stop offset="1" stopColor="#1f3a9c" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill={`url(#${gradientId})`} />
          <rect
            x="1"
            y="1"
            width="98"
            height="98"
            rx="23"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.18"
            strokeWidth="2"
          />
        </>
      )}
      <g transform={transform}>
        <polyline
          points="23,78 50,17 77,78"
          fill="none"
          stroke={ink}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[42, 50, 58].map((x) => (
          <circle key={x} cx={x} cy="59" r="2.7" fill={ink} />
        ))}
        {[23, 77].map((x) => (
          <g key={x}>
            <circle cx={x} cy="78" r="9" fill={ink} />
            <circle
              cx={x}
              cy="78"
              r="3.8"
              fill={badge ? "#1f3a9c" : "var(--color-background)"}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
