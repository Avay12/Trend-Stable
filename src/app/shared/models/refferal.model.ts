export interface ReferralStats {
  referralCode: string | null;
  referralBalance: number;
  totalEarnings: number;
  commissionRate: number;
  totalReferrals: number;
}

export interface ApplyReferralResponse {
  message: string;
  referralCode: string;
}