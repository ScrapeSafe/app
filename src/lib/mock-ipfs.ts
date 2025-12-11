// Mock IPFS upload - in production, use Pinata, Infura, or web3.storage
export const mockUploadToIPFS = async (data: object | File): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock CID
  const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  return `ipfs://${mockCid}`;
};

export const mockFetchFromIPFS = async (uri: string): Promise<object> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return mock data
  return {
    name: "Mock Content",
    description: "This is mock IPFS content",
    terms: "Standard license terms apply",
  };
};
