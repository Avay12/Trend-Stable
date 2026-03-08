export interface PaymentOrder {
  currency: string;
  status: string;
  transactionId: string;
  amount: number;
  user: string;
  createdAt: string;
}

export interface GetAllPaymentsResponse {
  payments: PaymentOrder[];
  total: number;
  totalPages: number;
  totalAmount: string;
}


export interface UserPaymentOrder {
  currency: string;
  status: string;
  transactionId: string;
  amount: number;
  createdAt: string;
}


export interface CryptoToken {
  name: string;
  currency: string;
  network: string;
  iconSymbol: string;
}


export interface GetUserPaymentsResponse {
  payments: UserPaymentOrder[];
  total: number;
  totalPages: number;
}