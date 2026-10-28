import type { Category } from "./types";

/** Category names as shown to users (pt-BR). */
export const CATEGORY_LABELS: Record<Category, string> = {
  CPU: "Processador",
  MOTHERBOARD: "Placa-mãe",
  MEMORY: "Memória RAM",
  GPU: "Placa de vídeo",
  STORAGE: "Armazenamento",
  PSU: "Fonte",
  CASE: "Gabinete",
  COOLER: "Cooler",
};
