import { serverTimestamp } from "firebase/firestore";

export type Inventory = {
  name: string;
  category: string;
  description: string;
  fragility: number;
  id: string;
  imageUrl: string;
  longDescription: string;
  price: number;
  quantity: number;
  totalOrders: number;
  createdAt:
    | { seconds: number; nanoseconds: number }
    | null
    | ReturnType<typeof serverTimestamp>; // Not null timestamp
};

export type Order = {
  id: string; // Primary Key
  createdAt: { seconds: number; nanoseconds: number }; // Not null timestamp
  discountCode?: string; // Optional
  discountTypeApplied?: string; // Optional
  driverId?: string; // Foreign Key, optional
  driverStatus?: "Complete" | "Pending" | "Accepted" | "Arrived" | "ArrivedD";
  dropoffPhoto?: string; // Optional
  orderDistance?: string; // Optional
  orderStatus: "Complete" | "Pending" | "Accepted" | "Arrived" | "ArrivedD";
  paymentIntentId?: string; // Optional
  paymentStatus: "Accepted";
  pickupPhoto?: string; // Optional
  price?: number; // Optional
  destination?: string; // Optional
  origin?: string; // Optional
  userId?: string; // Foreign Key, optional
  stripeAccountId?: string; // Optional
  rejectedBy?: string[]; // Optional array
  orderType?: string; // Optional
  subtotal?: number; // Optional
};
