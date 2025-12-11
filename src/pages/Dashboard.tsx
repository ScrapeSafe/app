import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LicenseBadge } from '@/components/ui/license-badge';
import { LicenseSettingsModal } from '@/components/modals/LicenseSettingsModal';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { IPAsset, License, LicenseType } from '@/types';
import { Globe, FileText, Plus, Bot, Brain, Settings, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const { isConnected, address, connect } = useWallet();
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<{ ipId: string; type: LicenseType } | null>(null);

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  const loadData = () => {
    if (!address) return;
    setAssets(storage.getIPAssetsByOwner(address));
    setLicenses(storage.getLicenses());
  };

  const websites = assets.filter((a) => a.type === 'website');
  const content = assets.filter((a) => a.type === 'content');

  const getLicenseForAsset = (ipId: string, type: LicenseType) => {
    return licenses.find((l) => l.ipId === ipId && l.licenseType === type);
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Creator Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to manage your IP assets and licenses.
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <p className="text-muted-foreground">Manage your registered IP assets and licenses</p>
          </div>
        </div>

        {/* Websites Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Websites</h2>
            </div>
            <Link to="/register-website">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Website
              </Button>
            </Link>
          </div>

          {websites.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No websites registered yet</p>
                <Link to="/register-website">
                  <Button variant="outline">Register Your First Website</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {websites.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  scrapeLicense={getLicenseForAsset(asset.ipId, 'scrape')}
                  trainLicense={getLicenseForAsset(asset.ipId, 'train')}
                  onSetLicense={(type) => setSelectedAsset({ ipId: asset.ipId, type })}
                />
              ))}
            </div>
          )}
        </section>

        {/* Content Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Content IP</h2>
            </div>
            <Link to="/register-content">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </Link>
          </div>

          {content.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No content registered yet</p>
                <Link to="/register-content">
                  <Button variant="outline">Register Your First Content</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  scrapeLicense={getLicenseForAsset(asset.ipId, 'scrape')}
                  trainLicense={getLicenseForAsset(asset.ipId, 'train')}
                  onSetLicense={(type) => setSelectedAsset({ ipId: asset.ipId, type })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedAsset && (
        <LicenseSettingsModal
          open={!!selectedAsset}
          onOpenChange={() => setSelectedAsset(null)}
          ipId={selectedAsset.ipId}
          licenseType={selectedAsset.type}
          existingLicense={getLicenseForAsset(selectedAsset.ipId, selectedAsset.type)}
          onSave={loadData}
        />
      )}
    </Layout>
  );
};

const AssetCard = ({
  asset,
  scrapeLicense,
  trainLicense,
  onSetLicense,
}: {
  asset: IPAsset;
  scrapeLicense?: License;
  trainLicense?: License;
  onSetLicense: (type: LicenseType) => void;
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{asset.title}</CardTitle>
            <CardDescription className="font-mono text-xs truncate">
              {asset.domain || asset.contentUrl}
            </CardDescription>
          </div>
          {asset.type === 'website' ? (
            <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted-foreground">ipId:</span>
          <span className="truncate">{asset.ipId.slice(0, 10)}...{asset.ipId.slice(-6)}</span>
        </div>

        <div className="flex gap-2">
          <LicenseBadge type="scrape" enabled={scrapeLicense?.enabled} />
          <LicenseBadge type="train" enabled={trainLicense?.enabled} />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onSetLicense('scrape')}
          >
            <Bot className="h-3 w-3 mr-1" />
            Scrape
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onSetLicense('train')}
          >
            <Brain className="h-3 w-3 mr-1" />
            Train
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
