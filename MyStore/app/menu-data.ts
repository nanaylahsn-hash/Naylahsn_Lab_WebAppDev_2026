export type MenuItem = {
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string;
  badge?: string;
};

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Nasi Goreng Kampung",
    desc: "Nasi goreng dengan telur mata sapi, ayam suwir, dan kerupuk.",
    price: 28000,
    image: "/nasigoreng.jpeg",
    badge: "Terlaris",
  },
  {
    id: 2,
    name: "Sate Ayam 10 Tusuk",
    desc: "Sate ayam bakar dengan bumbu kacang dan lontong.",
    price: 35000,
    image: "/sateayam.jpeg",
  },
  {
    id: 3,
    name: "Soto Ayam Lamongan",
    desc: "Kuah kuning gurih dengan koya, telur rebus, dan sambal.",
    price: 26000,
    image: "/sotoayam.jpeg",
  },
  {
    id: 4,
    name: "Rendang Daging",
    desc: "Daging sapi empuk yang dimasak lama dengan santan dan rempah.",
    price: 45000,
    image: "/rendang.jpeg",
    badge: "Favorit",
  },
  {
    id: 5,
    name: "Mie Ayam Bakso",
    desc: "Mie kenyal, ayam kecap, dua bakso, dan pangsit goreng.",
    price: 24000,
    image: "/mieayam.jpeg",
  },
  {
    id: 6,
    name: "Es Campur",
    desc: "Segar dengan alpukat, kelapa muda, cincau, dan sirup.",
    price: 18000,
    image: "/escampur.jpeg",
    badge: "Segar",
  },
];

export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
