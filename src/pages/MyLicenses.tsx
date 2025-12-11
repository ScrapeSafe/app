import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LicenseBadge } from '@/components/ui/license-badge';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { PurchasedLicense, IPAsset } from '@/types';
import { FileText, Globe, Ticket, ExternalLink } from 'lucide-react';

const MyLicenses = () => {
  const { isConnected, address, connect } = useWallet();
  const [purchases, setPurchases] = useState<(PurchasedLicense & { asset?: IPAsset })[]>([]);

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  const loadData = () => {
    if (!address) return;
    
    const myPurchases = storage.getPurchasedLicensesByBuyer(address);
    const purchasesWithAssets = myPurchases.map((purchase) => ({
      ...purchase,
      asset: storage.getIPAssetByIpId(purchase.ipId),
    }));
    
    setPurchases(purchasesWithAssets);
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto text-center">
            <Ticket className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">My Licenses</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view your purchased licenses.
            </p>
            <Button onClick={connect} className="glow-cyan">
              Connect Wallet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Licenses</h1>
          <p className="text-muted-foreground">
            View all licenses you've purchased
          </p>
        </div>

        {purchases.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No Licenses Yet</p>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Browse the marketplace and purchase licenses to access IP assets.
              </p>
              <Link to="/market">
                <Button>Explore Marketplace</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {purchase.asset?.title || 'Unknown Asset'}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs truncate">
                        {purchase.asset?.domain || 'Content Asset'}
                      </CardDescription>
                    </div>
                    {purchase.asset?.type === 'website' ? (
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LicenseBadge type={purchase.licenseType} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License ID:</span>
                      <span className="font-mono">{purchase.licenseId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchased:</span>
                      <span>{new Date(purchase.purchasedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">TX Hash:</p>
                    <p className="font-mono text-xs truncate">{purchase.txHash}</p>
                  </div>

                  <Link to={`/license/${purchase.ipId}/${purchase.licenseType}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View License Info
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyLicenses;
