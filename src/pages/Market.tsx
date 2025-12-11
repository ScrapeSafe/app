import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LicenseBadge } from '@/components/ui/license-badge';
import { storage } from '@/lib/storage';
import { IPAsset, License } from '@/types';
import { Globe, FileText, Search, ShoppingBag, Filter, TrendingUp, Sparkles } from 'lucide-react';

const Market = () => {
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allAssets = storage.getIPAssets();
    const enabledLicenses = storage.getEnabledLicenses();
    
    const assetsWithLicenses = allAssets.filter((asset) =>
      enabledLicenses.some((l) => l.ipId === asset.ipId)
    );

    setAssets(assetsWithLicenses);
    setLicenses(enabledLicenses);
  };

  const getLicensesForAsset = (ipId: string) => {
    return licenses.filter((l) => l.ipId === ipId);
  };

  const filteredAssets = assets.filter((asset) => {
    const query = searchQuery.toLowerCase();
    return (
      asset.title.toLowerCase().includes(query) ||
      asset.domain?.toLowerCase().includes(query) ||
      asset.description.toLowerCase().includes(query)
    );
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="relative mb-12 pb-12 border-b border-border">
          <div className="orb orb-cyan w-[300px] h-[300px] -top-20 -right-20 opacity-20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-primary font-mono text-sm tracking-wider uppercase">IP Marketplace</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Discover Licensed <span className="text-gradient">Assets</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Browse AI-licensed content from creators worldwide. Purchase scraping or training licenses on-chain.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, domain, or description..."
              className="pl-12 h-12 text-base bg-card border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 px-6">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" className="h-12 px-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <div className="font-display text-2xl font-bold text-primary">{assets.length}</div>
            <div className="text-sm text-muted-foreground">Licensed Assets</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <div className="font-display text-2xl font-bold text-neon-green">{licenses.length}</div>
            <div className="text-sm text-muted-foreground">Active Licenses</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <div className="font-display text-2xl font-bold text-accent">
              {new Set(assets.map(a => a.ownerAddress)).size}
            </div>
            <div className="text-sm text-muted-foreground">Creators</div>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-16 text-center">
            <div className="inline-flex p-6 rounded-2xl bg-primary/10 mb-6">
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-3">No Licensed Assets Yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Be the first to register your content and start earning from AI agents.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="glow-cyan px-8">
                Register Your IP
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => {
              const assetLicenses = getLicensesForAsset(asset.ipId);
              const scrapeLicense = assetLicenses.find((l) => l.licenseType === 'scrape');
              const trainLicense = assetLicenses.find((l) => l.licenseType === 'train');

              return (
                <MarketCard
                  key={asset.id}
                  asset={asset}
                  scrapeLicense={scrapeLicense}
                  trainLicense={trainLicense}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

const MarketCard = ({
  asset,
  scrapeLicense,
  trainLicense,
}: {
  asset: IPAsset;
  scrapeLicense?: License;
  trainLicense?: License;
}) => {
  return (
    <div className="card-cyber rounded-xl bg-card border border-border overflow-hidden group">
      {/* Visual Header */}
      <div className="h-32 relative bg-gradient-to-br from-primary/20 via-accent/10 to-background overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${asset.type === 'website' ? 'bg-primary/20' : 'bg-accent/20'}`}>
              {asset.type === 'website' ? (
                <Globe className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-accent" />
              )}
            </div>
            <span className="text-xs font-mono uppercase text-muted-foreground">
              {asset.type}
            </span>
          </div>
        </div>
        {/* Animated scan line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] animate-[scan_3s_linear_infinite] opacity-0 group-hover:opacity-100" />
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors truncate">
          {asset.title}
        </h3>
        <p className="font-mono text-xs text-muted-foreground truncate mb-4">
          {asset.domain || 'Content Asset'}
        </p>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
          {asset.description || 'No description provided'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {scrapeLicense?.enabled && <LicenseBadge type="scrape" />}
          {trainLicense?.enabled && <LicenseBadge type="train" />}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {scrapeLicense?.enabled && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
              <p className="text-xs text-muted-foreground">Scrape</p>
              <p className="font-mono font-bold text-primary">{scrapeLicense.price} ETH</p>
            </div>
          )}
          {trainLicense?.enabled && (
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
              <p className="text-xs text-muted-foreground">Train</p>
              <p className="font-mono font-bold text-accent">{trainLicense.price} ETH</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {scrapeLicense?.enabled && (
            <Link to={`/license/${asset.ipId}/scrape`} className="flex-1">
              <Button size="sm" className="w-full">
                Buy Scrape
              </Button>
            </Link>
          )}
          {trainLicense?.enabled && (
            <Link to={`/license/${asset.ipId}/train`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full border-accent/30 text-accent hover:bg-accent/10">
                Buy Train
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Market;
