import { OG_SIZE } from "@/og/size";

// Same as opengraph-image, so X does not fall back to the site's default.
export { default } from "./opengraph-image";
export const alt = "A peça, suas especificações principais e o preço atual";
export const size = OG_SIZE;
export const contentType = "image/png";
