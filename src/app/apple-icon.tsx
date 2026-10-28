import { ImageResponse } from "next/og";
import { ChipMark } from "@/components/chip-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the tile is a plain square.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1115",
      }}
    >
      <ChipMark size={132} accent="#b6f23a" ink="#11140a" />
    </div>,
    size,
  );
}
