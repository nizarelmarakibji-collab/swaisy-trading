
export interface OrderItem {
  itemId: string;
  itemName: string;
  qty: number;
  price: number;
}

export type OrderStatus = 'pending' | 'in progress' | 'done';

export interface Order {
  orderId: string;
  storeName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  notes: string;
  status: OrderStatus;
  createdAt: Date;
  subtotal?: number;
  discount?: number; // percentage
  total: number;
  createdBy: string;
}

export interface Customer {
  id: string;
  name: string;
  frequentItemIds: string[];
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  categoryAr?: string;
  subCategory: string;
  subCategoryAr?: string;
  brand: string;
  weight: string;
  packaging: string;
  unitPerPack: string;
  stockStatus: string;
  defaultPrice: number;
  imageUrl: string;
  isSpecialOffer?: boolean;
}

export interface DraftOrder {
  storeName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  notes: string;
  discount?: number; // percentage
}

export type UserRole = 'admin' | 'salesman' | 'editor' | 'shop';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  // Shop specific details managed by admin
  storeName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface GalleryItem {
    id: string;
    name: string;
    data: string;
    type: string;
}