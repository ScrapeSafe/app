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
import { Globe, FileText, Plus, Bot, Brain, Wallet, Shield, TrendingUp, Layers } from 'lucide-react';

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

  const totalAssets = assets.length;
  const activeLicenses = licenses.filter((l) => l.enabled).length;

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center relative">
          <div className="orb orb-cyan w-[400px] h-[400px] top-1/4 left-1/4" />
          <div className="orb orb-purple w-[300px] h-[300px] bottom-1/4 right-1/4" style={{ animationDelay: '-3s' }} />
          
          <div className="max-w-lg mx-auto text-center relative z-10 px-4">
            <div className="inline-flex items-center justify-center p-6 rounded-2xl bg-primary/10 border border-primary/30 mb-8">
              <Shield className="h-16 w-16 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">Creator Dashboard</h1>
            <p className="text-lg text-muted-foreground mb-10">
              Connect your wallet to register IP assets and manage licenses.
            </p>
            <Button onClick={connect} size="lg" className="glow-cyan px-10 h-14 text-lg font-semibold">
              <Wallet className="h-5 w-5 mr-2" />
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
        {/* Header */}
        <div className="mb-10">
          <span className="text-primary font-mono text-sm tracking-wider uppercase">Creator Dashboard</span>
          <h1 className="font-display text-4xl font-bold mt-2">Manage Your IP Assets</h1>
          <p className="text-muted-foreground mt-2 text-lg">Register content and configure licensing terms</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatsCard
            icon={Layers}
            label="Total Assets"
            value={totalAssets.toString()}
            color="primary"
          />
          <StatsCard
            icon={Shield}
            label="Active Licenses"
            value={activeLicenses.toString()}
            color="green"
          />
          <StatsCard
            icon={Globe}
            label="Websites"
            value={websites.length.toString()}
            color="cyan"
          />
          <StatsCard
            icon={FileText}
            label="Content"
            value={content.length.toString()}
            color="purple"
          />
        </div>

        {/* Websites Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">Websites</h2>
                <p className="text-sm text-muted-foreground">Protected domains</p>
              </div>
            </div>
            <Link to="/register-website">
              <Button className="glow-cyan">
                <Plus className="h-4 w-4 mr-2" />
                Add Website
              </Button>
            </Link>
          </div>

          {websites.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No websites registered"
              description="Start protecting your websites from unauthorized AI scraping"
              action={{ label: "Register Website", href: "/register-website" }}
            />
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">Content IP</h2>
                <p className="text-sm text-muted-foreground">Images, articles, datasets</p>
              </div>
            </div>
            <Link to="/register-content">
              <Button variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </Link>
          </div>

          {content.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No content registered"
              description="Upload images, articles, or datasets to protect and monetize"
              action={{ label: "Register Content", href: "/register-content" }}
              variant="purple"
            />
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

const StatsCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'primary' | 'green' | 'cyan' | 'purple';
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 border-primary/30 text-primary',
    green: 'bg-neon-green/10 border-neon-green/30 text-neon-green',
    cyan: 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan',
    purple: 'bg-accent/10 border-accent/30 text-accent',
  };

  return (
    <div className="card-cyber rounded-xl p-5 bg-card border border-border">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${colorClasses[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'cyan',
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: { label: string; href: string };
  variant?: 'cyan' | 'purple';
}) => (
  <div className={`rounded-2xl border-2 border-dashed p-12 text-center ${
    variant === 'cyan' ? 'border-primary/20 bg-primary/5' : 'border-accent/20 bg-accent/5'
  }`}>
    <div className={`inline-flex p-4 rounded-xl mb-4 ${
      variant === 'cyan' ? 'bg-primary/10' : 'bg-accent/10'
    }`}>
      <Icon className={`h-8 w-8 ${variant === 'cyan' ? 'text-primary' : 'text-accent'}`} />
    </div>
    <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
    <Link to={action.href}>
      <Button variant={variant === 'cyan' ? 'default' : 'outline'} className={
        variant === 'purple' ? 'border-accent text-accent hover:bg-accent/10' : ''
      }>
        {action.label}
      </Button>
    </Link>
  </div>
);

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
  const hasActiveLicense = scrapeLicense?.enabled || trainLicense?.enabled;

  return (
    <div className="card-cyber rounded-xl bg-card border border-border overflow-hidden">
      {/* Header with gradient */}
      <div className={`h-2 ${
        hasActiveLicense 
          ? 'bg-gradient-to-r from-primary via-accent to-primary' 
          : 'bg-muted'
      }`} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{asset.title}</h3>
            <p className="font-mono text-xs text-muted-foreground truncate mt-1">
              {asset.domain || asset.contentUrl || 'Content Asset'}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${asset.type === 'website' ? 'bg-primary/10' : 'bg-accent/10'}`}>
            {asset.type === 'website' ? (
              <Globe className="h-5 w-5 text-primary" />
            ) : (
              <FileText className="h-5 w-5 text-accent" />
            )}
          </div>
        </div>

        {/* IP ID */}
        <div className="terminal rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">ipId:</span>
            <span className="font-mono text-xs text-primary truncate">
              {asset.ipId.slice(0, 12)}...{asset.ipId.slice(-8)}
            </span>
          </div>
        </div>

        {/* License Status */}
        <div className="flex gap-2 mb-4">
          <LicenseBadge type="scrape" enabled={scrapeLicense?.enabled} />
          <LicenseBadge type="train" enabled={trainLicense?.enabled} />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant={scrapeLicense?.enabled ? "default" : "outline"}
            className={scrapeLicense?.enabled ? "bg-primary/80 hover:bg-primary" : ""}
            onClick={() => onSetLicense('scrape')}
          >
            <Bot className="h-3 w-3 mr-1.5" />
            Scrape
          </Button>
          <Button
            size="sm"
            variant={trainLicense?.enabled ? "default" : "outline"}
            className={trainLicense?.enabled 
              ? "bg-accent/80 hover:bg-accent text-accent-foreground" 
              : "border-accent/30 text-accent hover:bg-accent/10"
            }
            onClick={() => onSetLicense('train')}
          >
            <Brain className="h-3 w-3 mr-1.5" />
            Train
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
