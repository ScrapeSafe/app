import { IPAsset, License, PurchasedLicense } from '@/types';

const STORAGE_KEYS = {
  IP_ASSETS: 'scrapesafe_ip_assets',
  LICENSES: 'scrapesafe_licenses',
  PURCHASED_LICENSES: 'scrapesafe_purchased_licenses',
  WALLET: 'scrapesafe_wallet',
};

export const storage = {
  // IP Assets
  getIPAssets: (): IPAsset[] => {
    const data = localStorage.getItem(STORAGE_KEYS.IP_ASSETS);
    return data ? JSON.parse(data) : [];
  },
  
  saveIPAsset: (asset: IPAsset): void => {
    const assets = storage.getIPAssets();
    assets.push(asset);
    localStorage.setItem(STORAGE_KEYS.IP_ASSETS, JSON.stringify(assets));
  },
  
  getIPAssetsByOwner: (ownerAddress: string): IPAsset[] => {
    return storage.getIPAssets().filter(a => a.ownerAddress.toLowerCase() === ownerAddress.toLowerCase());
  },
  
  getIPAssetByDomain: (domain: string): IPAsset | undefined => {
    return storage.getIPAssets().find(a => a.domain?.toLowerCase() === domain.toLowerCase());
  },
  
  getIPAssetById: (id: string): IPAsset | undefined => {
    return storage.getIPAssets().find(a => a.id === id);
  },

  getIPAssetByIpId: (ipId: string): IPAsset | undefined => {
    return storage.getIPAssets().find(a => a.ipId === ipId);
  },
  
  updateIPAsset: (id: string, updates: Partial<IPAsset>): void => {
    const assets = storage.getIPAssets();
    const index = assets.findIndex(a => a.id === id);
    if (index !== -1) {
      assets[index] = { ...assets[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.IP_ASSETS, JSON.stringify(assets));
    }
  },

  // Licenses
  getLicenses: (): License[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LICENSES);
    return data ? JSON.parse(data) : [];
  },
  
  saveLicense: (license: License): void => {
    const licenses = storage.getLicenses();
    const existingIndex = licenses.findIndex(
      l => l.ipId === license.ipId && l.licenseType === license.licenseType
    );
    
    if (existingIndex !== -1) {
      licenses[existingIndex] = license;
    } else {
      licenses.push(license);
    }
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));
  },
  
  getLicensesByIpId: (ipId: string): License[] => {
    return storage.getLicenses().filter(l => l.ipId === ipId);
  },
  
  getLicense: (ipId: string, licenseType: string): License | undefined => {
    return storage.getLicenses().find(
      l => l.ipId === ipId && l.licenseType === licenseType
    );
  },
  
  getEnabledLicenses: (): License[] => {
    return storage.getLicenses().filter(l => l.enabled);
  },

  // Purchased Licenses
  getPurchasedLicenses: (): PurchasedLicense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASED_LICENSES);
    return data ? JSON.parse(data) : [];
  },
  
  savePurchasedLicense: (purchase: PurchasedLicense): void => {
    const purchases = storage.getPurchasedLicenses();
    purchases.push(purchase);
    localStorage.setItem(STORAGE_KEYS.PURCHASED_LICENSES, JSON.stringify(purchases));
  },
  
  getPurchasedLicensesByBuyer: (buyerAddress: string): PurchasedLicense[] => {
    return storage.getPurchasedLicenses().filter(
      p => p.buyerAddress.toLowerCase() === buyerAddress.toLowerCase()
    );
  },

  // Wallet
  getWallet: (): { address: string } | null => {
    const data = localStorage.getItem(STORAGE_KEYS.WALLET);
    return data ? JSON.parse(data) : null;
  },
  
  saveWallet: (address: string): void => {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify({ address }));
  },
  
  clearWallet: (): void => {
    localStorage.removeItem(STORAGE_KEYS.WALLET);
  },
};
