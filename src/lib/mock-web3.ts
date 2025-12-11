// Mock Web3 functions - in production, use ethers.js or viem
export const generateMockIpId = (): string => {
  return `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`;
};

export const generateMockTxHash = (): string => {
  return `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`.substring(0, 66);
};

export const generateMockWalletAddress = (): string => {
  return `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`;
};

export const mockRegisterIP = async (): Promise<{ ipId: string; txHash: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    ipId: generateMockIpId(),
    txHash: generateMockTxHash(),
  };
};

export const mockSetLicenseTerms = async (): Promise<{ txHash: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    txHash: generateMockTxHash(),
  };
};

export const mockBuyLicense = async (): Promise<{ licenseId: string; txHash: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    licenseId: Math.random().toString().substring(2, 8),
    txHash: generateMockTxHash(),
  };
};
