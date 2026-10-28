export const CATEGORIES = [
  "CPU",
  "MOTHERBOARD",
  "MEMORY",
  "GPU",
  "STORAGE",
  "PSU",
  "CASE",
  "COOLER",
] as const;

export const SOCKETS = ["AM4", "AM5", "LGA1700", "LGA1851"] as const;

export const MEMORY_TYPES = ["DDR4", "DDR5"] as const;

export const MOTHERBOARD_FORM_FACTORS = [
  "E-ATX",
  "ATX",
  "Micro-ATX",
  "Mini-ITX",
] as const;

export const PSU_FORM_FACTORS = ["ATX", "SFX", "SFX-L"] as const;

export const PSU_EFFICIENCY_RATINGS = [
  "80 Plus",
  "80 Plus Bronze",
  "80 Plus Silver",
  "80 Plus Gold",
  "80 Plus Platinum",
  "80 Plus Titanium",
] as const;

export const PSU_MODULARITY = ["full", "semi", "none"] as const;

export const STORAGE_KINDS = ["SSD", "HDD"] as const;

export const STORAGE_INTERFACES = ["NVMe", "SATA"] as const;

/** "M.2" drives take an M.2 slot; 2.5" and 3.5" drives take a SATA port. */
export const STORAGE_FORM_FACTORS = ["M.2", "2.5in", "3.5in"] as const;

export const RADIATOR_SIZES_MM = [120, 140, 240, 280, 360, 420] as const;
