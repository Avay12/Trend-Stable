export interface CartItem {
    serviceId: number;
    serviceName: string;
    platform: string;
    category: string;
    rate: number;
    min: number;
    max: number;
    quantity: number;
    link?: string;
}

export interface Cart {
    userId: string;
    items: CartItem[];
    total: number;
    itemCount: number;
}
