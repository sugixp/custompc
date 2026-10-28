import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ChipMark } from "@/components/chip-mark";
import { SITE_NAME, SITE_URL } from "@/site";
import { OG_SIZE } from "./size";
import { truncate } from "./text";

// The site's colors (globals.css); ImageResponse has no CSS variables.
const COLOR = {
  bg: "#0f1115",
  surface: "#161920",
  line: "#2a2f3a",
  text: "#e6e8ec",
  muted: "#9ba3b1",
  accent: "#b6f23a",
  accentInk: "#11140a",
  ok: "#69db7c",
  warn: "#f2b84b",
  error: "#ff8787",
} as const;

// IBM Plex as on the site, from assets/fonts (WOFF: ImageResponse cannot
// read the WOFF2 that next/font serves).
const font = (file: string) =>
  readFile(join(process.cwd(), "assets/fonts", file));
const fontsPromise = Promise.all([
  font("IBMPlexSans-Regular.woff"),
  font("IBMPlexSans-SemiBold.woff"),
  font("IBMPlexMono-Medium.woff"),
]).then(([regular, semiBold, mono]) => [
  { name: "Plex Sans", data: regular, weight: 400 as const },
  { name: "Plex Sans", data: semiBold, weight: 600 as const },
  { name: "Plex Mono", data: mono, weight: 500 as const },
]);

export type Tone = "ok" | "warn" | "error";

export interface OgCard {
  /** Small mono line above the title. */
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Label/value pairs under the title, one line each (the build's parts). */
  rows?: { label: string; value: string }[];
  /** The figure at the bottom left: a price, or a muted note. */
  stat?: { label: string; value: string; muted?: boolean };
  /** A status chip at the bottom right. */
  badge?: { text: string; tone: Tone };
}

const clamp = (lines: number) =>
  ({
    display: "block",
    overflow: "hidden",
    lineClamp: lines,
  }) as const;

const oneLine = {
  display: "block",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
} as const;

function Card({ eyebrow, title, subtitle, rows, stat, badge }: OgCard) {
  // With rows (a build), title and subtitle get one line each, so even
  // the longest names leave room for the parts and the total.
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 72px",
        background: COLOR.bg,
        color: COLOR.text,
        fontFamily: "Plex Sans",
        borderTop: `8px solid ${COLOR.accent}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "Plex Mono",
          fontSize: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ChipMark size={48} accent={COLOR.accent} ink={COLOR.accentInk} />
          <span>{SITE_NAME}</span>
        </div>
        <span style={{ color: COLOR.muted, fontSize: 22 }}>
          {SITE_URL.host}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            ...oneLine,
            fontFamily: "Plex Mono",
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: COLOR.accent,
          }}
        >
          {truncate(eyebrow, 60)}
        </div>
        <div
          style={{
            ...clamp(rows ? 1 : 2),
            marginTop: 16,
            fontSize: rows ? 52 : 64,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: -1,
          }}
        >
          {truncate(title, 80)}
        </div>
        {subtitle && (
          <div
            style={{
              ...clamp(rows ? 1 : 2),
              marginTop: 18,
              fontSize: 28,
              lineHeight: 1.35,
              color: COLOR.muted,
            }}
          >
            {truncate(subtitle, 140)}
          </div>
        )}
        {rows && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 24,
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    width: 250,
                    flexShrink: 0,
                    fontFamily: "Plex Mono",
                    fontSize: 22,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: COLOR.muted,
                  }}
                >
                  {row.label}
                </span>
                <span style={{ ...oneLine, flex: 1, fontSize: 36 }}>
                  {truncate(row.value, 48)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: `2px solid ${COLOR.line}`,
          paddingTop: 24,
          minHeight: 110,
        }}
      >
        {stat ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "Plex Mono",
                fontSize: 22,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: COLOR.muted,
              }}
            >
              {stat.label}
            </span>
            <span
              style={{
                marginTop: 4,
                fontFamily: "Plex Mono",
                fontSize: stat.muted ? 40 : 60,
                color: stat.muted ? COLOR.muted : COLOR.accent,
              }}
            >
              {stat.value}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 28, color: COLOR.muted }}>
            Preços em reais · lojas brasileiras · compatibilidade
          </span>
        )}
        {badge && (
          <span
            style={{
              display: "flex",
              padding: "10px 22px",
              border: `2px solid ${COLOR[badge.tone]}`,
              borderRadius: 8,
              background: COLOR.surface,
              color: COLOR[badge.tone],
              fontFamily: "Plex Mono",
              fontSize: 28,
            }}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Renders a card. Pass `cacheSeconds` for images that read prices: the CDN
 * keeps them that long, so a shared link's crawler hits do not each query
 * the database.
 */
export async function renderOgImage(
  card: OgCard,
  { cacheSeconds }: { cacheSeconds?: number } = {},
): Promise<ImageResponse> {
  return new ImageResponse(<Card {...card} />, {
    ...OG_SIZE,
    fonts: await fontsPromise,
    headers: cacheSeconds
      ? {
          "Cache-Control": `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
        }
      : undefined,
  });
}
