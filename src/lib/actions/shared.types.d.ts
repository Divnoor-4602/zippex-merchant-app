export interface GetMonthlyRevenueProps {
  merchantId: string;
  numMonths: number;
}

export interface GetTotalRevenueProps {
  merchantId: string;
}

export interface GetTotalSalesProps {
  merchantId: string;
  numMonths?: number;
}

export interface GetRecentOrdersProps {
  merchantId: string;
  numMonths: number;
}

export interface GetInventoryParams {
  merchantId: string;
}

export interface GetProductProps {
  merchantId: string;
  productId: string;
}

export interface AddProductProps {
  merchantId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  fragility: number;
  category: string;
  imageUrl: any;
  createdAt: date;
  totalOrders: number;
}

export interface EditProductProps {
  merchantId: string;
  productId: string;
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  fragility?: number;
  category?: string;
  imageUrl?: any;
}

export interface GetMerchantCustomersProps {
  merchantId: string | undefined;
}

export interface GetDiscountsParams {
  merchantId: string;
}

export interface GetMonthlyProductSalesProps {
  merchantId: string;
  productId: string;
  numMonths: number;
}

export interface UpdateOrderStatusProps {
  orderId: string;
  orderStatus: string;
  merchantId: string;
}

export interface GetOrdersByStatusProps {
  orderStatus: string;
  merchantId: string;
}
