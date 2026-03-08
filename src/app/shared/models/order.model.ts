export interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  status: string;
  createdAt: string;
}

export interface OrderList {
  id: string;
  username: string;
  service: string;
  serviceId: string;
  provider: string;
  quantity: number;
  charge: number;
  status: string;
  createdAt: string;
  link: string;
}

export interface UsersOrder {
  orders: OrderList[];
  total: number;
}

export interface Orders {
  data: Order[];
  total: number;
}

export interface OrderStats {
  byStatus: Array<{
    status: string;
    _count: number;
    _sum: {
      charge: number;
      quantity: number;
    };
  }>;
  total: {
    count: number;
    totalSpent: number;
    totalQuantity: number;
  };
}
