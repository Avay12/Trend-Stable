export interface PromoCode {
  id: string;
  code: string;
  bonusPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Headline {
  id: string;
  text: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}