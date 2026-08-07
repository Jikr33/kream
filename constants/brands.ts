export const BRANDS = {
  Nike: "https://cdn.simpleicons.org/nike/111111",
  Adidas: "https://cdn.simpleicons.org/adidas/111111",
  "New Balance": "https://cdn.simpleicons.org/newbalance/111111",
  ASICS:
    "https://brandlogos.net/wp-content/uploads/2016/03/asics-1992-2006-logo-512x230.png",
  Salomon:
    "https://brandlogos.net/wp-content/uploads/2016/11/salomon_group_2012-2022-logo_brandlogos.net_bqdlb-512x323.png",
  Converse:
    "https://img.logo.dev/converse.com?token=live_6a1a28fd-6420-4492-aeb0-b297461d9de2&size=128&retina=true&format=png",
  Vans: "https://whatthelogo.com/storage/logos/vans-227580.png",
  Timberland: "https://whatthelogo.com/storage/logos/timberland-99731.png",
  "Dr. Martens":
    "https://brandlogos.net/wp-content/uploads/2023/01/dr-martens-logo-512x512.png",
  Puma: "https://logo-index.com/wp-content/uploads/2026/05/puma.svg",
  Reebok:
    "https://logo-index.com/wp-content/uploads/2026/05/reebok.svg",
  Jordan:
    "https://logo-index.com/wp-content/uploads/2026/05/air-jordan.svg",
  Balenciaga:
    "https://logo-index.com/wp-content/uploads/2026/05/balenciaga.svg",
  Gucci:
    "https://logo-index.com/wp-content/uploads/2026/05/gucci.svg",
  "Louis Vuitton":
    "https://logo-index.com/wp-content/uploads/2026/06/louis-vuitton.svg",
  Dior: "https://logo-index.com/wp-content/uploads/2026/05/dior.svg",
} as const;

export type BrandName = keyof typeof BRANDS;

/** Get logo URL from brand name */
export function getBrandLogo(name: string): string {
  return BRANDS[name as BrandName] || "";
}

/** Get brand id (slug) from brand name */
export function getBrandId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

/** Get brand name from brand id (slug) */
export function getBrandName(id: string): string {
  const entry = Object.entries(BRANDS).find(
    ([name]) => getBrandId(name) === id,
  );
  return entry ? entry[0] : id;
}

/** Get all brands as array of { id, name, logo } */
export function getBrandList(): { id: string; name: string; logo: string }[] {
  return Object.entries(BRANDS).map(([name, logo]) => ({
    id: getBrandId(name),
    name,
    logo,
  }));
}
