import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletState } from '@/types';
import { storage } from '@/lib/storage';
import { generateMockWalletAddress } from '@/lib/mock-web3';
import { toast } from 'sonner';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
  });

  useEffect(() => {
    const savedWallet = storage.getWallet();
    if (savedWallet) {
      setWallet({
        address: savedWallet.address,
        isConnected: true,
      });
    }
  }, []);

  const connect = async () => {
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 800));
      const address = generateMockWalletAddress();
      
      storage.saveWallet(address);
      setWallet({
        address,
        isConnected: true,
      });
      
      toast.success('Wallet connected successfully');
    } catch (error) {
      toast.error('Failed to connect wallet');
      throw error;
    }
  };

  const disconnect = () => {
    storage.clearWallet();
    setWallet({
      address: null,
      isConnected: false,
    });
    toast.info('Wallet disconnected');
  };

  return (
    <WalletContext.Provider value={{ ...wallet, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
