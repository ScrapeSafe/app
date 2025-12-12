import { createContext, useContext, ReactNode } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { WalletState } from '@/types';
import { toast } from 'sonner';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  
  // Get the primary wallet address
  const walletAddress = wallets.length > 0 ? wallets[0].address : null;
  const isConnected = authenticated && ready && walletAddress !== null;

  const connect = async () => {
    try {
      await login();
      toast.success('Wallet connected successfully');
    } catch (error) {
      toast.error('Failed to connect wallet');
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      await logout();
      toast.info('Wallet disconnected');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    }
  };

  return (
    <WalletContext.Provider value={{ 
      address: walletAddress, 
      isConnected, 
      connect, 
      disconnect 
    }}>
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
