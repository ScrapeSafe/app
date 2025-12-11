import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LicenseType, License } from '@/types';
import { storage } from '@/lib/storage';
import { mockUploadToIPFS } from '@/lib/mock-ipfs';
import { mockSetLicenseTerms } from '@/lib/mock-web3';
import { toast } from 'sonner';
import { Loader2, Bot, Brain } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

interface LicenseSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipId: string;
  licenseType: LicenseType;
  existingLicense?: License;
  onSave: () => void;
}

export const LicenseSettingsModal = ({
  open,
  onOpenChange,
  ipId,
  licenseType,
  existingLicense,
  onSave,
}: LicenseSettingsModalProps) => {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(existingLicense?.enabled ?? false);
  const [price, setPrice] = useState(existingLicense?.price ?? '0.01');
  const [paymentToken, setPaymentToken] = useState(
    existingLicense?.paymentToken ?? '0x0000000000000000000000000000000000000000'
  );
  const [terms, setTerms] = useState('');

  const isNativeToken = paymentToken === '0x0000000000000000000000000000000000000000';

  const handleSave = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Upload terms to IPFS
      const termsData = {
        licenseType,
        terms,
        price,
        paymentToken,
        createdAt: new Date().toISOString(),
      };
      const termsUri = await mockUploadToIPFS(termsData);

      // Set terms on-chain (mocked)
      await mockSetLicenseTerms();

      // Save to storage
      const license: License = {
        id: existingLicense?.id ?? crypto.randomUUID(),
        ipId,
        licenseType,
        enabled,
        price,
        paymentToken,
        termsUri,
        receiverAddress: address,
        createdAt: existingLicense?.createdAt ?? new Date().toISOString(),
      };

      storage.saveLicense(license);
      toast.success(`${licenseType === 'scrape' ? 'Scrape' : 'Training'} license settings saved`);
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save license settings');
    } finally {
      setLoading(false);
    }
  };

  const Icon = licenseType === 'scrape' ? Bot : Brain;
  const title = licenseType === 'scrape' ? 'Scrape License Settings' : 'Training License Settings';
  const description = licenseType === 'scrape'
    ? 'Configure how AI agents can scrape your content'
    : 'Configure how your content can be used for AI training';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable License</Label>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (ETH)</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentToken">Payment Token Address</Label>
            <Input
              id="paymentToken"
              value={paymentToken}
              onChange={(e) => setPaymentToken(e.target.value)}
              placeholder="0x0000...0000 for native token"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              {isNativeToken ? 'Using native ETH' : 'Using ERC-20 token'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">License Terms</Label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Enter your license terms and conditions..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Terms will be uploaded to IPFS
            </p>
          </div>

          <div className="p-3 rounded-lg bg-secondary border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Receiver:</strong>{' '}
              <span className="font-mono text-xs">{address}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
