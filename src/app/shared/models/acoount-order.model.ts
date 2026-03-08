export interface AccountOrder {
  id: string;
  platform: string;
  username: string;
  type: string;
  price: number;
  followers: number;
  description: string;
}

export interface SellAccountorder {
  id: string;
  platform: string;
  ownerUser: string;
  username: string;
  type: string;
  price: number;
  followers: number;
  description: string;
}

export interface CreateAccountOrder {
  platform: string;
  username: string;
  type: string;
  price: number;
  followers: number;
  description: string;
}
