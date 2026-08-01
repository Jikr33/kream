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
  Vans: "https://brandlogos.net/wp-content/uploads/2023/01/vans-logo-512x512.png",
  Timberland:
    "https://brandlogos.net/wp-content/uploads/2023/01/timberland-logo-512x512.png",
  "Dr. Martens":
    "https://brandlogos.net/wp-content/uploads/2023/01/dr-martens-logo-512x512.png",
  Puma: "https://brandlogos.net/wp-content/uploads/2023/01/puma-logo-512x512.png",
  Hoka: "https://brandlogos.net/wp-content/uploads/2023/01/hoka-logo-512x512.png",
  Reebok:
    "https://brandlogos.net/wp-content/uploads/2023/01/reebok-logo-512x512.png",
  Jordan:
    "https://brandlogos.net/wp-content/uploads/2023/01/jordan-logo-512x512.png",
  Balenciaga:
    "https://brandlogos.net/wp-content/uploads/2023/01/balenciaga-logo-512x512.png",
  Gucci:
    "https://brandlogos.net/wp-content/uploads/2023/01/gucci-logo-512x512.png",
  "Louis Vuitton":
    "https://brandlogos.net/wp-content/uploads/2023/01/louis-vuitton-logo-512x512.png",
  Dior: "https://brandlogos.net/wp-content/uploads/2023/01/dior-logo-512x512.png",
  Prada:
    "https://brandlogos.net/wp-content/uploads/2023/01/prada-logo-512x512.png",
  Fendi:
    "https://brandlogos.net/wp-content/uploads/2023/01/fendi-logo-512x512.png",
  "Off-White":
    "https://brandlogos.net/wp-content/uploads/2023/01/off-white-logo-512x512.png",
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
