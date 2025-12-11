export type AssetType = 'website' | 'content';
export type LicenseType = 'scrape' | 'train';

export interface IPAsset {
  id: string;
  ipId: string;
  type: AssetType;
  title: string;
  description: string;
  domain?: string;
  contentUrl?: string;
  metadataUri: string;
  ownerAddress: string;
  verified: boolean;
  createdAt: string;
}

export interface License {
  id: string;
  ipId: string;
  licenseType: LicenseType;
  enabled: boolean;
  price: string;
  paymentToken: string;
  termsUri: string;
  receiverAddress: string;
  createdAt: string;
}

export interface PurchasedLicense {
  id: string;
  licenseId: string;
  ipId: string;
  licenseType: LicenseType;
  buyerAddress: string;
  txHash: string;
  purchasedAt: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
}
