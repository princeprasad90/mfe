export type Product = {
  id: number;
  name: string;
  description: string;
};

export const products: Product[] = [
  { id: 1, name: "Laptop Pro", description: "14-inch business laptop with extended battery life." },
  { id: 2, name: "Wireless Mouse", description: "Ergonomic mouse with silent clicks and USB receiver." },
  { id: 3, name: "Monitor 27", description: "27-inch IPS monitor with 1440p resolution." },
  { id: 4, name: "USB-C Dock", description: "Multi-port docking station for workstation setups." }
];
