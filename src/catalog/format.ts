// pt-BR number formatting for specs. Units follow a space (Brazilian usage):
// "3,8 GHz", "65 W", "1 TB".

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const list = new Intl.ListFormat("pt-BR", { type: "conjunction" });

export const formatNumber = (value: number) => decimal.format(value);

export const formatGhz = (mhz: number) => `${decimal.format(mhz / 1000)} GHz`;

export const formatWatts = (watts: number) => `${decimal.format(watts)} W`;

export const formatMm = (mm: number) => `${decimal.format(mm)} mm`;

/** Drive and kit capacities: 480 GB, 1 TB, 2 TB (decimal units, as vendors use). */
export function formatCapacity(gb: number): string {
  return gb >= 1000
    ? `${decimal.format(gb / 1000)} TB`
    : `${decimal.format(gb)} GB`;
}

export const formatYesNo = (value: boolean) => (value ? "Sim" : "Não");

export const formatList = (items: readonly string[]) => list.format(items);

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

/** When an offer was seen, in Brasília time: "27/10/2026, 12:00". */
export const formatSeenAt = (date: Date) => dateTime.format(date);

const dateTimeShort = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

/** Compact form for narrow screens: "27/10, 12:00". */
export const formatSeenAtShort = (date: Date) => dateTimeShort.format(date);
