export interface Service {
    service: number;
    name: string;
    type: string;
    category: string;
    rate: number;
    min: number;
    max: number;
    refill: boolean;
    dripfeed: boolean;
    cancel: boolean;
    average_time: number;
}

export interface Services {
    data: Service[];
    total: number;
}